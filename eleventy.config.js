import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItToc from 'markdown-it-table-of-contents';
import htmlmin from 'html-minifier-terser';
import fs from 'node:fs';
import path from 'node:path';
import Graph from 'graphology';
import { hierarchy, tree as d3tree } from 'd3-hierarchy';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(str) {
  return removeAccents(str)
    .trim()
    .replace(/\s+|'/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-') // remove double hyphens
    .toLowerCase();
}

const PLACEHOLDER_PREFIX = '_LINK_';
const PLACEHOLDER_SUFFIX = '_';

export default function (eleventyConfig) {
  // Ajouter les pages paginées aux collections
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/manifest.json');
  eleventyConfig.addPassthroughCopy('src/favicon.svg');
  eleventyConfig.addPassthroughCopy('src/favicon.ico');
  eleventyConfig.addPassthroughCopy({
    'node_modules/alpinejs/dist/module.esm.min.js': 'assets/alpine.mjs',
  });

  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
    quotes: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'],
    typographer: true,
  })
    .use(markdownItAnchor, {
      level: [2, 3], // <h2>, <h3>
    })
    .use(markdownItToc, {
      includeLevel: [2, 3], // <h2>, <h3>
      markerPattern: /^\[toc\]/im,
    });

  // Transformer les liens wiki avant le traitement markdown
  eleventyConfig.addPreprocessor('wikilinks', '*', (data, content) => {
    if (!data.page.filePathStem.startsWith('/wiki/')) {
      return content;
    }

    // Transforme les liens wiki [[...]] en liens markdown
    // [[The Council]] -> [The Council](/wiki/the-council/)
    // [[The Council | Le jeu The Council]] -> [Le jeu The Council](/wiki/the-council/)
    // [[the COuncil | ]] -> [the COuncil](/wiki/the-council/)
    // [[dead]] -> <u>dead</u> (si le fichier n'existe pas)
    const transformed = content.replace(
      /\[\[([^\]|]+)(?:\s*\|\s*([^\]]*))?\]\]/g,
      (match, slug, displayText) => {
        // Normaliser le slug (minuscules, espaces en tirets)
        const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

        // Utiliser le texte d'affichage s'il existe et n'est pas vide, sinon utiliser le slug original
        const text =
          displayText && displayText.trim() ? displayText.trim() : slug;

        // Vérifier si le fichier existe
        const wikiFilePath = path.join('src/wiki', `${normalizedSlug}.md`);
        const fileExists = fs.existsSync(wikiFilePath);

        if (fileExists) {
          // Créer un lien markdown normal
          return `[${text}](/wiki/${normalizedSlug}/)`;
        } else {
          // Créer un lien mort souligné en rouge
          return `<u>${text}</u>`;
        }
      }
    );

    return transformed;
  });

  eleventyConfig.addFilter('br_to_paragraph', function (content) {
    const normalizedContent = content.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');
    return md.render(normalizedContent);
  });

  function replaceTypographicQuotes(text) {
    // double quotes to typographic
    text = text.replace(/"([^"]*)"/g, '«\u202F$1\u202F»');
    // simple quotes to typographic
    text = text.replace(/'/g, '\u2019');
    return text;
  }

  function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  eleventyConfig.addFilter('links_html', function (content, record) {
    // Combiner les liens et les dates dans une liste unique, triée par longueur décroissante
    const allItems = [];

    // Ajouter les liens
    if (record.links && Array.isArray(record.links)) {
      record.links.forEach((link) => {
        if (link.anchor) {
          const anchorTypographic = replaceTypographicQuotes(link.anchor);
          allItems.push({
            text: anchorTypographic,
            html: `<a href="/records/${link.id}" title="${link.title}">${anchorTypographic}</a>`,
            length: anchorTypographic.length,
          });
        }
      });
    }

    // Ajouter les dates
    if (record.dates && Array.isArray(record.dates)) {
      record.dates.forEach((dateObj) => {
        if (dateObj.inline) {
          const dateString = `${dateObj.date.day}-${dateObj.date.month}-${dateObj.date.year}`;
          allItems.push({
            text: dateObj.inline,
            html: `<a href="/dates/#${dateString}">${dateObj.inline}</a>`,
            length: dateObj.inline.length,
          });
        }
      });
    }

    // Trier par longueur décroissante pour traiter les expressions longues avant les courtes
    allItems.sort((a, b) => b.length - a.length);

    const replacements = [];

    // Remplacer tous les éléments par des placeholders
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const escapedText = escapeRegExp(removeAccents(item.text));
      const regex = new RegExp(`\\b(${escapedText})\\b`, 'g');
      const placeholder = `${PLACEHOLDER_PREFIX}${i}${PLACEHOLDER_SUFFIX}`;

      const contentWithoutAccents = removeAccents(content);
      const matches = [];
      let match;

      while ((match = regex.exec(contentWithoutAccents)) !== null) {
        matches.push({ index: match.index, length: match[0].length });
      }

      // Traiter les matches en ordre inverse pour ne pas décaler les indices
      for (let j = matches.length - 1; j >= 0; j--) {
        const { index, length } = matches[j];
        replacements.push({
          placeholder,
          html: item.html,
        });
        content =
          content.slice(0, index) + placeholder + content.slice(index + length);
      }
    }

    // Restaurer les placeholders par les vrais liens
    for (const replacement of replacements) {
      content = content.replace(replacement.placeholder, replacement.html);
    }

    return content;
  });

  eleventyConfig.addFilter('frenchQuotes', function (content) {
    // Remplace les guillemets doubles par des guillemets français avec espaces fines insécables
    // mais uniquement en dehors des balises HTML
    content = replaceTypographicQuotes(content);

    // Espaces insécables avant la ponctuation double
    // Espace fine insécable (U+202F) avant ; ! ?
    content = content.replace(/\s*([;!?])/g, '\u202F$1');
    // Espace normale insécable (U+00A0) avant :
    content = content.replace(/\s*(:)/g, '\u00A0$1');
    // Espace normale insécable (U+00A0) avant "p.43"
    content = content.replace(/\s*((p.\d+))/g, '\u00A0$1');

    // Espaces insécables avant %, °, et entre chiffres et unités courantes
    content = content.replace(/(\d)\s*([%°])/g, '$1\u00A0$2');
    // Unités courantes (km, m, kg, etc.)
    content = content.replace(
      /(\d)\s*(km|m|cm|mm|kg|g|mg|L|ml|h|min|s)\b/g,
      '$1\u00A0$2'
    );

    // Ordinaux en exposant
    content = content.replace(/(\d+)(er|ère|e|ème|è)/g, '$1<sup>$2</sup>');

    return content;
  });

  const quoteRegex = /\(([^)]*\b[A-Z][a-z]+\d+\s+p\.\d+[^)]*)\)/g;

  eleventyConfig.addFilter('bibliographyIndex', function (content, record) {
    // Transforme les références bibliographiques en numéros d'index incrémentés
    // Format: (Auteur Année p.page) ou (Auteur Année p.page ; Auteur Année p.page)
    // Remplace par des numéros: 1, 2, 3, ...

    let indexCounter = 0;

    // Regex qui capture les références bibliographiques au format (Auteur Année p.xxx)
    // Peut contenir plusieurs références séparées par " ; "

    content = content.replace(quoteRegex, () => {
      indexCounter++;
      return `<sup><a id="fnref-${indexCounter}" href="/records/${record.id}/#fn-${indexCounter}">${indexCounter}</a></sup>`;
    });

    return content;
  });

  eleventyConfig.addFilter('bibliographyFootnotes', function (content) {
    // Extrait les références bibliographiques et les formate comme des notes de bas de page
    // Utilise le même système de numérotation que le filtre bibliographyIndex

    const references = [];

    let match;
    while ((match = quoteRegex.exec(content)) !== null) {
      // match[1] contient le contenu entre parenthèses
      const refContent = match[1];
      const authorYearMatch = refContent.match(/^([A-Z][a-z]+\d+)/);
      references.push({
        text: refContent,
        authorYear: authorYearMatch ? authorYearMatch[1] : null,
      });
    }

    if (references.length === 0) {
      return '';
    }

    // Traiter les références pour remplacer les auteurs consécutifs par "Ibid."
    const processedReferences = references.map((ref, index) => {
      if (
        index > 0 &&
        ref.authorYear &&
        ref.authorYear === references[index - 1].authorYear
      ) {
        return ref.text.replace(/^[A-Z][a-z]+\d+/, '<i>Ibid.</i>');
      }
      return ref.text;
    });

    // Formate les références comme des notes de bas de page avec ancres et lien de retour
    let footnotes = '<ol>';
    processedReferences.forEach((ref, index) => {
      const n = index + 1;
      footnotes += `<li id="fn-${n}">${ref} <a href="#fnref-${n}" aria-label="Retour au texte">↩︎</a></li>\n`;
    });
    footnotes += '</ol>';

    return footnotes;
  });

  eleventyConfig.addFilter('formatNumber', function (number) {
    return new Intl.NumberFormat('fr-FR').format(number);
  });

  function marksOnContent(content, words) {
    const escapedWords = words.map((word) =>
      escapeRegExp(replaceTypographicQuotes(word))
    );
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    return content.replace(regex, '<mark>$1</mark>');
  }

  eleventyConfig.addFilter('highlightWord', function (content, word) {
    if (!word) {
      return content;
    }

    return marksOnContent(content, [word]);
  });

  eleventyConfig.addFilter('highlightRecord', function (content, record) {
    if (!record) {
      return content;
    }

    return marksOnContent(content, [record.title, ...(record.alias || [])]);
  });

  eleventyConfig.addFilter('dateToRfc3339', function (date) {
    // Convertir la date en format RFC 3339 (ISO 8601)
    if (!date) {
      return '';
    }

    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString();
  });

  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;
  eleventyConfig.addGlobalData('today', dateString);

  // Minification HTML en mode production
  eleventyConfig.addTransform('htmlmin', function (content) {
    if (
      process.env.ELEVENTY_RUN_MODE === 'build' &&
      (this.page.outputPath || '').endsWith('.html')
    ) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        keepClosingSlash: true,
      });
    }
    return content;
  });

  // --- Deep Links Tree (d3-hierarchy, server-side SVG) ---

  let _deepLinksGraph = null;
  function getDeepLinksGraph() {
    if (!_deepLinksGraph) {
      const raw = JSON.parse(fs.readFileSync('src/_data/graph.json', 'utf8'));
      _deepLinksGraph = new Graph();
      _deepLinksGraph.import(raw);
    }
    return _deepLinksGraph;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildBfsTree(graph, rootId, maxDepth = 3) {
    if (!graph.hasNode(rootId)) return null;

    const visited = new Set([rootId]);
    const root = {
      id: rootId,
      title: graph.getNodeAttribute(rootId, 'title'),
      children: [],
    };
    let frontier = [root];

    for (let d = 0; d < maxDepth; d++) {
      const next = [];
      for (const parent of frontier) {
        graph.forEachNeighbor(parent.id, (neighborId) => {
          if (visited.has(neighborId)) return;
          visited.add(neighborId);
          const child = {
            id: neighborId,
            title: graph.getNodeAttribute(neighborId, 'title'),
            children: [],
          };
          parent.children.push(child);
          next.push(child);
        });
      }
      frontier = next;
    }

    return root;
  }

  eleventyConfig.addFilter('deepLinksTree', function (record) {
    const graph = getDeepLinksGraph();
    const treeData = buildBfsTree(graph, record.id);
    if (!treeData || treeData.children.length === 0) return '';

    const root = hierarchy(treeData);
    const dx = 18;
    const dy = 180;
    const layout = d3tree().nodeSize([dx, dy]);
    layout(root);

    // Shift all nodes so root lands at (0, 0)
    const offsetX = root.x;
    const offsetY = root.y;
    root.each((d) => {
      d.x -= offsetX;
      d.y -= offsetY;
    });

    let x0 = Infinity,
      x1 = -Infinity;
    let y1 = -Infinity;
    root.each((d) => {
      if (d.x < x0) x0 = d.x;
      if (d.x > x1) x1 = d.x;
      if (d.y > y1) y1 = d.y;
    });

    const marginTop = dx;
    const marginBottom = dx;
    const marginRight = 160;
    const h = x1 - x0 + marginTop + marginBottom;
    const w = y1 - dy + marginRight; // start from depth-1 column

    let svg = `<svg viewBox="${dy} ${x0 - marginTop} ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="deep-links-tree">`;

    // Links — skip edges from root (depth 0 → depth 1)
    for (const link of root.links()) {
      if (link.source.depth === 0) continue;
      svg += `<path d="M${link.source.y},${link.source.x}C${(link.source.y + link.target.y) / 2},${link.source.x} ${(link.source.y + link.target.y) / 2},${link.target.x} ${link.target.y},${link.target.x}" fill="none" stroke="var(--color-border, #ccc)" stroke-width="1"/>`;
    }

    // Nodes — skip root
    for (const node of root.descendants()) {
      if (node.depth === 0) continue;
      const hasChildren = node.children && node.children.length > 0;
      svg += `<g transform="translate(${node.y},${node.x})">`;
      svg += `<circle r="2.5" fill="currentColor"/>`;
      svg += `<a href="/records/${node.data.id}/">`;
      if (hasChildren) {
        svg += `<text x="-6" dy="0.32em" text-anchor="end" fill="currentColor">${escapeHtml(node.data.title)}</text>`;
      } else {
        svg += `<text x="6" dy="0.32em" fill="currentColor">${escapeHtml(node.data.title)}</text>`;
      }
      svg += `</a></g>`;
    }

    svg += '</svg>';
    return svg;
  });

  // Configurer la bibliothèque markdown
  eleventyConfig.setLibrary('md', md);

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
}

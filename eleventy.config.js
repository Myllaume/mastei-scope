import markdownIt from 'markdown-it';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function (eleventyConfig) {
  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
  });

  eleventyConfig.addFilter('br_to_paragraph', function (content) {
    const normalizedContent = content.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');
    return md.render(normalizedContent);
  });

  eleventyConfig.addFilter('links_html', function (content, links) {
    for (const link of links) {
      if (!link.anchor) {
        continue;
      }

      const escapedAnchor = escapeRegExp(link.anchor);
      const regex = new RegExp(`\\b(${escapedAnchor})\\b`, 'g');
      content = content.replace(
        regex,
        `<a href="/records/${link.id}" title="${link.title}">$1</a>`
      );
    }

    return content;
  });

  eleventyConfig.addFilter('frenchQuotes', function (content) {
    // Remplace les guillemets doubles par des guillemets français avec espaces fines insécables
    // mais uniquement en dehors des balises HTML
    // content = content.replace(/"([^"]*)"(?![^<]*>)/g, '«\u202F$1\u202F»');
    // Remplace les apostrophes droites par des apostrophes typographiques
    content = content.replace(/'/g, '\u2019');

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
      references.push(refContent);
    }

    if (references.length === 0) {
      return '';
    }

    // Formate les références comme des notes de bas de page avec ancres et lien de retour
    let footnotes =
      '<ol>';
    references.forEach((ref, index) => {
      const n = index + 1;
      footnotes += `<li id="fn-${n}">${ref} <a href="#fnref-${n}" aria-label="Retour au texte">↩︎</a></li>\n`;
    });
    footnotes += '</ol>';

    return footnotes;
  });

  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy({
    'node_modules/fuse.js/dist/fuse.mjs': 'assets/fuse.mjs',
  });

  // Calculer tous les tags uniques triés
  eleventyConfig.addCollection('allTags', function (collectionApi) {
    const records = collectionApi.items[0]?.data?.records || [];
    const tagsSet = new Set();

    records.forEach((record) => {
      if (record.tags && Array.isArray(record.tags)) {
        record.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
}

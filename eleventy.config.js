import markdownIt from 'markdown-it';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PLACEHOLDER_PREFIX = '_LINK_';
const PLACEHOLDER_SUFFIX = '_';

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

  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;
  eleventyConfig.addGlobalData('today', dateString);

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
  };
}

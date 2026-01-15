function replaceTypographicQuotes(text) {
  // double quotes to typographic
  text = text.replace(/"([^"]*)"/g, '«\u202F$1\u202F»');
  // simple quotes to typographic
  text = text.replace(/'/g, '\u2019');
  return text;
}

export default function (eleventyConfig, pluginOptions) {
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
}

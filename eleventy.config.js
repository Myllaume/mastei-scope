import markdownIt from 'markdown-it';

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

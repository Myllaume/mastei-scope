export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/assets');

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

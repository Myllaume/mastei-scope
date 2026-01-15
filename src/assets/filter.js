import Alpine from '/assets/alpine.mjs';

window.Alpine = Alpine;

(async () => {
  const response = await fetch('/assets/records-index.json');
  const records = await response.json();

  // Extraire tous les tags uniques
  const allTags = new Set();
  records.forEach((record) => {
    if (record.tags && Array.isArray(record.tags)) {
      record.tags.forEach((tag) => allTags.add(tag));
    }
  });
  const uniqueTags = Array.from(allTags).sort();

  Alpine.data('tagFilter', () => {
    return {
      selectedTags: new Set(),
      allTags: uniqueTags,
      filteredCount: records.length,

      updateFilter() {
        const items = document.querySelectorAll('[data-tags]');
        let count = 0;

        if (this.selectedTags.size === 0) {
          // Tout afficher
          items.forEach((item) => item.classList.remove('hidden'));
          count = items.length;
        } else {
          // Filtrer
          items.forEach((item) => {
            const tags = item.dataset.tags.split(',').filter((t) => t);
            const hasMatch = tags.some((tag) => this.selectedTags.has(tag));

            if (hasMatch) {
              item.classList.remove('hidden');
              count++;
            } else {
              item.classList.add('hidden');
            }
          });
        }

        this.filteredCount = count;
      },

      toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
        } else {
          this.selectedTags.add(tag);
        }
        this.updateFilter();
      },

      isTagSelected(tag) {
        return this.selectedTags.has(tag);
      },
    };
  });

  Alpine.start();
})();

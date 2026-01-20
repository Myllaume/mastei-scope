import Alpine from '/assets/alpine.mjs';
import Fuse from '/assets/fuse.mjs';

window.Alpine = Alpine;

Alpine.data('tableSort', () => ({
  sortColumn: 0,
  sortDirection: 1, // 1 = ascendant, -1 = descendant

  sort(columnIndex) {
    // Alterner la direction si on clique sur la même colonne
    if (this.sortColumn === columnIndex) {
      this.sortDirection *= -1;
    } else {
      this.sortColumn = columnIndex;
      this.sortDirection = 1;
    }

    const tbody = this.$root.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows
      .toSorted((rowA, rowB) => {
        const cellA = rowA.children[columnIndex];
        const cellB = rowB.children[columnIndex];

        // Extraire le texte (avec ou sans lien)
        const valueA = cellA.textContent.trim();
        const valueB = cellB.textContent.trim();

        // Comparaison numérique ou alphabétique
        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);
        const comparison =
          !isNaN(numA) && !isNaN(numB)
            ? numA - numB
            : valueA.toLowerCase().localeCompare(valueB.toLowerCase());

        return this.sortDirection === 1 ? comparison : -comparison;
      })
      .forEach((row) => tbody.appendChild(row));
  },

  indicator(columnIndex) {
    if (this.sortColumn !== columnIndex) return '⇅';
    return this.sortDirection === 1 ? '▲' : '▼';
  },
}));

Alpine.data('search', () => ({
  searchTerm: '',
  items: [],
  fuse: null,

  init() {
    this.items = Array.from(this.$root.querySelectorAll('ul a')).map((item) => {
      return {
        title: item.textContent.split(' • '),
        element: item,
      };
    });

    this.fuse = new Fuse(this.items, {
      keys: ['title'],
      threshold: 0.3,
      ignoreDiacritics: true,
    });

    this.filterList();
  },

  filterList() {
    if (!this.searchTerm.trim()) {
      this.items.forEach((item) => (item.element.style.display = ''));
      return;
    }

    const results = this.fuse.search(this.searchTerm);
    const resultItems = new Set(results.map((result) => result.item.element));

    this.items.forEach((item) => {
      item.element.style.display = resultItems.has(item.element) ? '' : 'none';
    });
  },
}));

Alpine.start();

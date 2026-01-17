import Alpine from '/assets/alpine.mjs';

window.Alpine = Alpine;

// Composant de tri de tableau
Alpine.data('tableSort', () => ({
  sortColumn: null,
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
        const valueA = (
          cellA.querySelector('a')?.textContent || cellA.textContent
        ).trim();
        const valueB = (
          cellB.querySelector('a')?.textContent || cellB.textContent
        ).trim();

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

Alpine.start();

console.log(Alpine);

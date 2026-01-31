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

Alpine.data('graph', (defaultNode) => ({
  open: window.location.hash.slice(1) || defaultNode,

  init() {
    window.addEventListener('hashchange', () => {
      this.open = window.location.hash.slice(1);
    });
  },

  selectNode(node) {
    window.location.hash = node;
  },
}));

Alpine.data('tagsGraph', () => ({
  allNodes: null,
  allLinks: null,

  init() {
    this.allNodes = this.$root.querySelectorAll('.node');
    this.allLinks = this.$root.querySelectorAll('path[data-source]');
  },

  highlightNode(nodeTag, highlight) {
    const connectedNodes = new Set([nodeTag]);
    const connectedLinks = [];

    this.allLinks.forEach((link) => {
      const sourceTag = link.getAttribute('data-source');
      const targetTag = link.getAttribute('data-target');

      if (sourceTag === nodeTag || targetTag === nodeTag) {
        connectedLinks.push(link);
        connectedNodes.add(sourceTag);
        connectedNodes.add(targetTag);
      }
    });

    if (highlight) {
      // Illuminer les liens connectés
      connectedLinks.forEach((link) => {
        link.classList.add('highlighted-link');
      });

      // Illuminer les nœuds connectés
      this.allNodes.forEach((node) => {
        const tag = node.getAttribute('data-tag');
        if (connectedNodes.has(tag)) {
          node.classList.add('highlighted-node');
        }
      });
    } else {
      // Restaurer l'apparence normale des liens
      connectedLinks.forEach((link) => {
        link.classList.remove('highlighted-link');
      });

      // Restaurer l'apparence normale des nœuds
      this.allNodes.forEach((node) => {
        const tag = node.getAttribute('data-tag');
        if (connectedNodes.has(tag)) {
          node.classList.remove('highlighted-node');
        }
      });
    }
  },
}));

Alpine.data('tagsTimeline', (timelineData, minYear, maxYear, tags) => ({
  showBar: false,
  barPosition: 0,
  currentYear: null,
  timelineData,
  minYear,
  maxYear,
  tags,

  handleMouseMove(event) {
    const axis = this.$refs.axis;
    const container = this.$refs.container;
    const axisRect = axis.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const relativeX = event.clientX - axisRect.left;
    const absoluteX =
      containerRect.left + (relativeX / axisRect.width) * containerRect.width;

    // Calculer l'année correspondante
    const percent = relativeX / axisRect.width;
    this.currentYear = Math.round(
      this.minYear + percent * (this.maxYear - this.minYear)
    );

    this.barPosition = absoluteX;
    this.showBar = true;
  },

  handleMouseLeave() {
    this.showBar = false;
    this.currentYear = null;
  },

  getCountForTag(tag) {
    if (!this.currentYear) return '';
    const yearData = this.timelineData.find((d) => d.year === this.currentYear);
    return yearData ? ` (${yearData[tag]})` : '';
  },
}));

Alpine.start();

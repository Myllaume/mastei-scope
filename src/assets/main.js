import Alpine from '/assets/alpine.mjs';

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

  async init() {
    this.items = Array.from(this.$root.querySelectorAll('ul a')).map((item) => {
      const originalText = item.textContent;
      const title = originalText.split(' • ').join(' ');
      return {
        element: item,
        originalText: originalText,
        normalizedTitle: this.normalize(title),
      };
    });

    this.filterList();
  },

  normalize(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  },

  filterList() {
    const needle = this.normalize(this.searchTerm);

    if (needle.length < 2) {
      this.items.forEach((item) => {
        item.element.classList.remove('hide');
        item.element.textContent = item.originalText;
      });
      return;
    }

    const len = this.items.length;

    for (let i = 0; i < len; i++) {
      const item = this.items[i];
      const shouldHide = !item.normalizedTitle.includes(needle);
      item.element.classList.toggle('hide', shouldHide);
    }

    this.highlightMatches(needle);
  },

  highlightMatches(needle) {
    for (const item of this.items) {
      if (item.element.classList.contains('hide')) {
        item.element.textContent = item.originalText;
        continue;
      }

      let normalizedText = '',
        mapping = [];

      for (let j = 0; j < item.originalText.length; j++) {
        const normalized = this.normalize(item.originalText[j]);
        mapping.push(...Array(normalized.length).fill(j));
        normalizedText += normalized;
      }

      const matchIndex = normalizedText.indexOf(needle);
      if (matchIndex < 0) continue;

      // Construire le HTML avec <mark>
      const startPos = mapping[matchIndex];
      const endPos = mapping[matchIndex + needle.length - 1] + 1;
      const mark = document.createElement('mark');
      mark.textContent = item.originalText.substring(startPos, endPos);

      item.element.replaceChildren(
        ...(startPos
          ? [document.createTextNode(item.originalText.substring(0, startPos))]
          : []),
        mark,
        ...(endPos < item.originalText.length
          ? [document.createTextNode(item.originalText.substring(endPos))]
          : [])
      );
    }
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

Alpine.data('peopleGraph', () => ({
  allNodes: null,
  allLinks: null,

  init() {
    this.allNodes = this.$root.querySelectorAll('.node');
    this.allLinks = this.$root.querySelectorAll('path[data-source]');
  },

  highlightNode(personId, highlight) {
    const connectedNodes = new Set([personId]);
    const connectedLinks = [];

    this.allLinks.forEach((link) => {
      const source = link.getAttribute('data-source');
      const target = link.getAttribute('data-target');

      if (source === personId || target === personId) {
        connectedLinks.push(link);
        connectedNodes.add(source);
        connectedNodes.add(target);
      }
    });

    if (highlight) {
      // Illuminer les liens connectés
      connectedLinks.forEach((link) => {
        link.classList.add('highlighted-link');
      });

      // Illuminer les nœuds connectés
      this.allNodes.forEach((node) => {
        const person = node.getAttribute('data-person');
        if (connectedNodes.has(person)) {
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
        const person = node.getAttribute('data-person');
        if (connectedNodes.has(person)) {
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

Alpine.data('recordPreview', () => ({
  // Configuration
  HOVER_DELAY: 300,
  PREVIEW_WORDS_COUNT: 30,
  PREVIEW_OFFSET_Y: 10,
  
  // État
  showPreview: false,
  previewTitle: '',
  previewContent: '',
  previewX: 0,
  previewY: 0,
  currentLink: null,
  hoverTimeout: null,
  
  // Cache partagé entre toutes les instances
  cache: new Map(),

  init() {
    // Délégation d'événements pour performance
    this.$root.addEventListener('mouseover', this.onMouseOver.bind(this));
    this.$root.addEventListener('mouseout', this.onMouseOut.bind(this));
  },

  onMouseOver(event) {
    const link = event.target.closest('a[href^="/records/"]');
    if (!link || link === this.currentLink) return;
    
    this.schedulePreview(link);
  },

  onMouseOut(event) {
    const link = event.target.closest('a[href^="/records/"]');
    if (!link) return;
    
    this.hidePreview();
  },

  schedulePreview(link) {
    this.cancelScheduledPreview();
    this.currentLink = link;

    this.hoverTimeout = setTimeout(() => {
      this.showPreviewForLink(link);
    }, this.HOVER_DELAY);
  },

  cancelScheduledPreview() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  },

  async showPreviewForLink(link) {
    const url = link.getAttribute('href');
    
    this.positionPopup(link);
    
    // Afficher immédiatement l'état de chargement si pas en cache
    if (!this.cache.has(url)) {
      this.displayPreview({ title: '', content: 'Chargement…' });
    }
    
    const data = await this.getRecordData(url);
    if (!data) return;

    this.displayPreview(data);
  },

  positionPopup(link) {
    const rect = link.getBoundingClientRect();
    this.previewX = rect.left + rect.width / 2;
    this.previewY = rect.top + window.scrollY - this.PREVIEW_OFFSET_Y;
  },

  async getRecordData(url) {
    // Retourner depuis le cache si disponible
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Fetch et extraire les données
    try {
      const html = await this.fetchPage(url);
      const data = this.parseRecordHTML(html);
      
      // Mettre en cache pour réutilisation
      this.cache.set(url, data);
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la preview:', error);
      return null;
    }
  },

  async fetchPage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  },

  parseRecordHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = this.extractTitle(doc);
    const content = this.extractContent(doc);

    return { title, content };
  },

  extractTitle(doc) {
    return doc.querySelector('header h1')?.textContent.trim() || '';
  },

  extractContent(doc) {
    const mainElement = doc.querySelector('main.prose');
    if (!mainElement) return '';

    const text = mainElement.textContent.trim();
    const words = text.split(/\s+/);
    
    if (words.length <= this.PREVIEW_WORDS_COUNT) {
      return text;
    }

    return words.slice(0, this.PREVIEW_WORDS_COUNT).join(' ') + '…';
  },

  displayPreview({ title, content }) {
    this.previewTitle = title;
    this.previewContent = content;
    this.showPreview = true;
  },

  hidePreview() {
    this.cancelScheduledPreview();
    this.showPreview = false;
    this.currentLink = null;
  },
}));

Alpine.start();

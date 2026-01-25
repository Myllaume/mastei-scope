class Search {
  constructor() {
    this.debounceDelay = 300;
    this.minSearchLength = 2;
    this.pagefind = null;
    this.searchTimeout = null;

    // <template> elements
    this.templates = {
      result: null,
      noResults: null,
    };
  }

  initializeElements() {
    this.searchForm = document.getElementById('mastei-search');
    this.searchInput = document.getElementById('search-term');
    this.resultsContainer = document.getElementById('search-results');
    this.resultsList = document.getElementById('search-results-list');
    this.resultsCount = document.getElementById('search-results-count');

    this.templates.result = document.getElementById('search-result-template');
    this.templates.noResults = document.getElementById(
      'search-no-results-template'
    );
  }

  async loadPagefind() {
    if (!this.pagefind) {
      this.pagefind = await import('/pagefind/pagefind.js');
      await this.pagefind.init();
    }
    return this.pagefind;
  }

  clearResults() {
    this.resultsCount.innerHTML = 'Résultats';
    this.resultsList.innerHTML = '';
  }

  sanitizeExcerpt(excerpt) {
    return excerpt
      .replace(/</g, '&lt;')
      .replace(/&lt;mark>/g, '<mark>')
      .replace(/&lt;\/mark>/g, '</mark>');
  }

  createResultElement(result) {
    const clone = this.templates.result.content.cloneNode(true);

    const link = clone.querySelector('a');
    link.href = result.url;

    const title = clone.querySelector('.search-results-item-title');
    if (result.meta.title) {
      title.innerHTML = `<strong>${result.meta.title}</strong>`;
    } else {
      title.textContent = result.url;
    }

    const excerpt = clone.querySelector('.search-results-item-matches');
    excerpt.innerHTML = this.sanitizeExcerpt(result.excerpt);

    return clone;
  }

  addResult(result) {
    const resultElement = this.createResultElement(result);
    this.resultsList.append(resultElement);
  }

  showNoResults() {
    const noResultsElement = this.templates.noResults.content.cloneNode(true);
    this.resultsList.append(noResultsElement);
  }

  updateResultsCount(count) {
    const plural = count !== 1 ? 's' : '';
    this.resultsCount.innerHTML = `${count} résultat${plural}`;
  }

  toggleResultsVisibility(show) {
    this.resultsContainer.classList.toggle('hide', !show);
  }

  async performSearch(query) {
    this.clearResults();

    if (query.length < this.minSearchLength) {
      this.toggleResultsVisibility(false);
      return;
    }

    this.toggleResultsVisibility(true);

    const searchResults = await this.pagefind.search(query);
    const results = await Promise.all(
      searchResults.results.map((r) => r.data())
    );

    if (results.length > 0) {
      results.forEach((result) => this.addResult(result));
      this.updateResultsCount(results.length);
      this.resultsList.classList.remove('search-results-notfound');
    } else {
      this.showNoResults();
      this.resultsList.classList.add('search-results-notfound');
    }
  }

  handleSearchInput(query) {
    window.clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(() => {
      this.performSearch(query);
    }, this.debounceDelay);
  }

  updateURL(query) {
    const path = query ? `/search/?q=${encodeURIComponent(query)}` : '/search/';
    window.history.replaceState({}, '', path);
  }

  getQueryFromURL() {
    const urlParams = new URL(document.location.href).searchParams;
    const query = urlParams.get('q');
    return query ? decodeURIComponent(query) : '';
  }

  setupSearchForm() {
    if (!this.searchForm) return;

    this.searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  }

  setupSearchInput() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', (event) => {
      const query = event.target.value;
      this.handleSearchInput(query);
      this.updateURL(query);
    });

    // Initialisation avec la recherche de l'URL si présente
    const initialQuery = this.getQueryFromURL();
    if (initialQuery) {
      this.searchInput.value = initialQuery;
      this.performSearch(initialQuery);
    }

    this.searchInput.focus();
  }

  async init() {
    this.initializeElements();
    await this.loadPagefind();
    this.setupSearchForm();
    this.setupSearchInput();
  }
}

const search = new Search();
search.init();

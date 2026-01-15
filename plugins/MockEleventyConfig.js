/**
 * Mock de l'objet eleventyConfig pour simuler le comportement réel de 11ty
 * Utilisé dans les tests pour reproduire l'API d'Eleventy
 */
class MockEleventyConfig {
  constructor() {
    this.filters = new Map();
  }

  addFilter(name, filterFunction) {
    this.filters.set(name, filterFunction);
  }

  getFilter(name) {
    return this.filters.get(name);
  }
}

export default MockEleventyConfig;

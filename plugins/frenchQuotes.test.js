import frenchQuotesPlugin from './frenchQuotes.js';
import MockEleventyConfig from './MockEleventyConfig.js';

describe('frenchQuotes Plugin', () => {
  let eleventyConfig;
  let frenchQuotesFilter;

  beforeEach(() => {
    // Initialize the 11ty config mock
    eleventyConfig = new MockEleventyConfig();

    // Load the plugin (simulates real 11ty execution)
    frenchQuotesPlugin(eleventyConfig, {});

    // Retrieve the registered filter
    frenchQuotesFilter = eleventyConfig.getFilter('frenchQuotes');
  });

  describe('Typographic quotes', () => {
    it('transforms multiple pairs of quotes', () => {
      const input = 'Il a dit "bonjour" puis "au revoir"';
      const expected =
        'Il a dit «\u202Fbonjour\u202F» puis «\u202Fau revoir\u202F»';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('transforms straight apostrophes to typographic', () => {
      const input = "L'histoire de l'humanité";
      const expected = 'L\u2019histoire de l\u2019humanité';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });
  });

  describe('Non-breaking spaces before punctuation', () => {
    it('adds a thin non-breaking space before semicolon', () => {
      const input = 'Bonjour ; comment allez-vous';
      const expected = 'Bonjour\u202F; comment allez-vous';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a thin non-breaking space before exclamation mark', () => {
      const input = 'Attention !';
      const expected = 'Attention\u202F!';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a thin non-breaking space before question mark', () => {
      const input = 'Comment vas-tu ?';
      const expected = 'Comment vas-tu\u202F?';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a normal non-breaking space before colon', () => {
      const input = 'Attention : danger';
      const expected = 'Attention\u00A0: danger';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });
  });

  describe('Page references', () => {
    it('adds a non-breaking space before p.43', () => {
      const input = 'Voir p.43 pour plus de détails';
      const expected = 'Voir\u00A0p.43 pour plus de détails';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('handles multiple page references', () => {
      const input = 'Voir p.43 et p.127';
      const expected = 'Voir\u00A0p.43 et\u00A0p.127';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });
  });

  describe('Non-breaking spaces with units', () => {
    it('adds a non-breaking space before percent', () => {
      const input = '50 % de réduction';
      const expected = '50\u00A0% de réduction';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a non-breaking space before degrees', () => {
      const input = '25 °C';
      const expected = '25\u00A0°C';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a non-breaking space between numbers and distance units', () => {
      const input = '100 km, 50 m, 25 cm, 10 mm';
      const expected = '100\u00A0km, 50\u00A0m, 25\u00A0cm, 10\u00A0mm';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a non-breaking space between numbers and mass units', () => {
      const input = '5 kg, 100 g, 50 mg';
      const expected = '5\u00A0kg, 100\u00A0g, 50\u00A0mg';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a non-breaking space between numbers and volume units', () => {
      const input = '2 L, 500 ml';
      const expected = '2\u00A0L, 500\u00A0ml';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('adds a non-breaking space between numbers and time units', () => {
      const input = '2 h 30 min 45 s';
      const expected = '2\u00A0h 30\u00A0min 45\u00A0s';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });
  });

  describe('Ordinals as superscript', () => {
    it('transforms 1er to superscript', () => {
      const input = 'Le 1er janvier';
      const expected = 'Le 1<sup>er</sup> janvier';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('transforms 1ère to superscript', () => {
      const input = 'La 1ère fois';
      const expected = 'La 1<sup>ère</sup> fois';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('transforms 2e to superscript', () => {
      const input = 'Le 2e chapitre';
      const expected = 'Le 2<sup>e</sup> chapitre';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('transforms 3ème to superscript', () => {
      const input = 'Le 3ème arrondissement';
      const expected = 'Le 3<sup>ème</sup> arrondissement';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('transforms 4è to superscript', () => {
      const input = 'Le 4è trimestre';
      const expected = 'Le 4<sup>è</sup> trimestre';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });

    it('handles multiple ordinals', () => {
      const input = 'Du 1er au 21e siècle';
      const expected = 'Du 1<sup>er</sup> au 21<sup>e</sup> siècle';
      expect(frenchQuotesFilter(input)).toBe(expected);
    });
  });
});

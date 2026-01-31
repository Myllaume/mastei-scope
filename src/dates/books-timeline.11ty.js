import { generateTimeline } from '../_includes/timeline-generator.js';

export const data = {
  layout: 'base.liquid',
  title: 'Timeline des livres',
};

export default function (data) {
  return generateTimeline({
    title: 'Timeline des livres',
    description:
      "Ce graphe montre l'évolution du nombre de fiches mentionnant chaque livre au fil du temps. Plus la courbe est haute, plus le livre est cité pour cette année.",
    dates: data.dates,
    recordsGrouped: data.records_by_book,
    // Pas de itemsFilter = affiche tous les livres
    formatLabel: (book) => book, // Les noms de livres sont déjà formatés
    alpineComponent: 'tagsTimeline',
    countMethod: 'getCountForTag',
  });
}

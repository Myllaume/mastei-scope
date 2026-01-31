import {
  generateTimeline,
  formatSlugAsLabel,
} from '../_includes/timeline-generator.js';

export const data = {
  layout: 'base.liquid',
  title: 'Timeline des tags',
};

/**
 * Tags à afficher (pays européens + principaux belligérants)
 * L'ordre définit l'ordre d'affichage dans la timeline
 */
const TAGS_TO_DISPLAY = [
  'albanie',
  'allemagne',
  'autriche',
  'belgique',
  'bulgarie',
  'danemark',
  'espagne',
  'finlande',
  'france',
  'grece',
  'hongrie',
  'italie',
  'pays-bas',
  'pologne',
  'portugal',
  'roumanie',
  'royaume-uni',
  'suede',
  'suisse',
  'tchecoslovaquie',
  'turquie',
  'ukraine',
  'union-sovietique',
  'yougoslavie',
  'japon',
  'etats-unis-d-amerique',
];

export default function (data) {
  return generateTimeline({
    title: 'Timeline des tags',
    description:
      "Ce graphe montre l'évolution du nombre de fiches mentionnant chaque tag au fil du temps. Plus la courbe est haute, plus le tag est cité pour cette année.",
    dates: data.dates,
    recordsGrouped: data.records_by_tag,
    itemsFilter: TAGS_TO_DISPLAY,
    formatLabel: formatSlugAsLabel,
    alpineComponent: 'tagsTimeline',
    countMethod: 'getCountForTag',
  });
}

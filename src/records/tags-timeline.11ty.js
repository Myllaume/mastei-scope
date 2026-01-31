import * as d3 from 'd3';

export const data = {
  layout: 'base.liquid',
  title: 'Timeline des tags',
};

// Tags à afficher (extensible)
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
  const dates = data.dates;
  const recordsByTag = data.records_by_tag;

  // Créer un map des records par tag
  const tagRecordsMap = new Map();
  for (const tagData of recordsByTag) {
    if (TAGS_TO_DISPLAY.includes(tagData.key)) {
      tagRecordsMap.set(tagData.key, new Set(tagData.records.map((r) => r.id)));
    }
  }

  // Agréger les données par année et par tag
  const yearlyData = new Map();

  for (const dateEntry of dates) {
    const year = dateEntry.date.year;
    if (!yearlyData.has(year)) {
      yearlyData.set(year, {});
      for (const tag of TAGS_TO_DISPLAY) {
        yearlyData.get(year)[tag] = 0;
      }
    }

    for (const record of dateEntry.records) {
      for (const tag of TAGS_TO_DISPLAY) {
        if (tagRecordsMap.get(tag)?.has(record.id)) {
          yearlyData.get(year)[tag]++;
        }
      }
    }
  }

  // Convertir en array trié par année
  const sortedYears = Array.from(yearlyData.keys()).sort((a, b) => a - b);
  const timelineData = sortedYears.map((year) => ({
    year,
    ...yearlyData.get(year),
  }));

  // Calculer les valeurs max pour chaque tag
  const maxValues = {};
  for (const tag of TAGS_TO_DISPLAY) {
    maxValues[tag] = Math.max(...timelineData.map((d) => d[tag]), 1);
  }

  const rowHeight = 40;
  const rowGap = 5;

  // Générer les ticks pour l'axe X
  const years = timelineData.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const tickStep = Math.ceil((maxYear - minYear) / 10);
  const xTicks = [];
  for (let y = minYear; y <= maxYear; y += tickStep) {
    xTicks.push(y);
  }

  // Générer le HTML avec des lignes individuelles
  let rowsHtml = '';

  TAGS_TO_DISPLAY.forEach((tag, index) => {
    const maxValue = maxValues[tag];
    const tagLabel =
      tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ');

    const innerWidth = 1000; // largeur interne fixe pour le viewBox

    // Échelle X pour ce SVG
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(timelineData, (d) => d.year))
      .range([0, innerWidth]);

    // Échelle Y pour ce tag
    const yScale = d3.scaleLinear().domain([0, maxValue]).range([rowHeight, 0]);

    // Aire simple
    const area = d3
      .area()
      .x((d) => xScale(d.year))
      .y0(rowHeight)
      .y1((d) => yScale(d[tag]))
      .curve(d3.curveMonotoneX);

    const pathD = area(timelineData);

    let gridLines = '';
    for (const tick of xTicks) {
      const x = xScale(tick);
      gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${rowHeight}" class="grid-line" />`;
    }

    rowsHtml += `
      <div class="timeline-row">
        <div class="tag-label">
          ${tagLabel}<span x-text="getCountForTag('${tag}')"></span>
        </div>
        <div class="timeline-svg-container">
          <svg class="timeline-svg" viewBox="0 0 ${innerWidth} ${rowHeight}" preserveAspectRatio="none">
            ${gridLines}
            <line x1="0" y1="${rowHeight}" x2="${innerWidth}" y2="${rowHeight}" class="base-line" />
            <path d="${pathD}" fill="var(--color-gray-800)" />
          </svg>
        </div>
      </div>
    `;
  });

  let axisHtml =
    '<div class="timeline-axis" x-ref="axis" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">';
  for (const tick of xTicks) {
    const percent = ((tick - minYear) / (maxYear - minYear)) * 100;
    axisHtml += `<span class="year-tick" style="left: ${percent}%">${tick}</span>`;
  }
  axisHtml += `<span x-show="currentYear" class="current-year" x-text="currentYear" :style="'transform: translateX(' + barPosition + 'px)'"></span>`;
  axisHtml += '</div>';

  return `
    <style>
      .timeline-container {
        width: 100%;
      }
      
      .timeline-row {
        display: flex;
        flex-direction: column;
      }

      .timeline-row + .timeline-row {
        margin-top: ${rowGap}px;
      }
      
      .tag-label {
        font-size: 12px;
        font-weight: bold;
        padding: 2px 0;
      }
      
      .timeline-svg-container {
        width: 100%;
        height: ${rowHeight}px;
      }
      
      .timeline-svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      
      .base-line {
        stroke: var(--color-gray-300);
        stroke-width: 1;
      }
      
      .grid-line {
        stroke: var(--color-gray-200);
        stroke-dasharray: 2, 4;
        stroke-width: 0.5;
      }
      
      .timeline-axis {
        position: sticky;
        bottom: 0;
        width: 100%;
        height: 24px;
        border-top: 1px solid var(--color-gray-300);
        background-color: white;
        z-index: 10;
        cursor: crosshair;
      }
      
      .year-tick {
        position: absolute;
        transform: translateX(-50%);
        font-size: 12px;
        color: var(--color-gray-800);
        top: 4px;
      }
      
      .current-year {
        position: fixed;
        bottom: 0;
        left: 0;
        height: 1em;
        font-weight: bold;
        color: var(--color-highlight);
        background-color: white;
        padding: 2px 8px;
        z-index: 11;
        will-change: transform;
      }
      
      .comparison-bar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 1px;
        background-color: var(--color-highlight);
        pointer-events: none;
        z-index: 11;
        will-change: transform;
      }
    </style>

    <div x-data='tagsTimeline(${JSON.stringify(timelineData)}, ${minYear}, ${maxYear}, ${JSON.stringify(TAGS_TO_DISPLAY)})'>
      <h1>Timeline des tags</h1>
      <p>Ce graphe montre l'évolution du nombre de fiches mentionnant chaque tag au fil du temps. Plus la courbe est haute, plus le tag est cité pour cette année.</p>
      
      <div class="timeline-container" x-ref="container">
        ${rowsHtml}
        ${axisHtml}
      </div>
      
      <div x-show="showBar" class="comparison-bar" :style="'transform: translateX(' + barPosition + 'px)'"></div>
    </div>
  `;
}

import * as d3 from 'd3';

export const data = {
  layout: 'base.liquid',
  title: 'Timeline des tags',
};

// Tags à afficher (extensible)
const TAGS_TO_DISPLAY =[
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

  // Dimensions SVG
  const margin = { top: 40, right: 30, bottom: 60, left: 120 };
  const width = 900;
  const rowHeight = 100;
  const rowGap = 20;
  const height = TAGS_TO_DISPLAY.length * (rowHeight + rowGap) - rowGap;
  const innerWidth = width - margin.left - margin.right;

  // Échelle X (années)
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(timelineData, (d) => d.year))
    .range([0, innerWidth]);

  // Générer les ticks pour l'axe X
  const years = timelineData.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const tickStep = Math.ceil((maxYear - minYear) / 15);
  const xTicks = [];
  for (let y = minYear; y <= maxYear; y += tickStep) {
    xTicks.push(y);
  }

  // Construire le SVG
  let svgContent = '';

  // Axe X (années)
  svgContent += `<g transform="translate(${margin.left}, ${margin.top + height})">`;
  svgContent += `<line x1="0" y1="0" x2="${innerWidth}" y2="0" stroke="var(--color-gray-500)" />`;
  for (const tick of xTicks) {
    const x = xScale(tick);
    svgContent += `<line x1="${x}" y1="0" x2="${x}" y2="6" stroke="var(--color-gray-500)" />`;
    svgContent += `<text x="${x}" y="20" text-anchor="middle" class="year-label">${tick}</text>`;
  }
  svgContent += `<text x="${innerWidth / 2}" y="45" text-anchor="middle" class="axis-label">Année</text>`;
  svgContent += '</g>';

  // Dessiner les horizons pour chaque tag
  TAGS_TO_DISPLAY.forEach((tag, index) => {
    const yOffset = margin.top + index * (rowHeight + rowGap);
    const maxValue = maxValues[tag];

    // Échelle Y pour ce tag
    const yScale = d3.scaleLinear().domain([0, maxValue]).range([rowHeight, 0]);

    svgContent += `<g transform="translate(${margin.left}, ${yOffset})">`;

    // Ligne de base
    svgContent += `<line x1="0" y1="${rowHeight}" x2="${innerWidth}" y2="${rowHeight}" class="grid-line" />`;

    // Aire simple
    const area = d3
      .area()
      .x((d) => xScale(d.year))
      .y0(rowHeight)
      .y1((d) => yScale(d[tag]))
      .curve(d3.curveMonotoneX);

    const pathD = area(timelineData);
    svgContent += `<path d="${pathD}" fill="var(--color-black)" opacity="0.7" class="horizon-area" />`;

    // Label du tag
    const tagLabel =
      tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ');
    svgContent += `<text x="-10" y="${rowHeight / 2}" text-anchor="end" dominant-baseline="middle" class="tag-label">${tagLabel}</text>`;

    svgContent += '</g>';
  });

  const svgHeight = height + margin.top + margin.bottom;

  return `
    <style>
      .timeline-container {
        max-width: 100%;
        overflow-x: auto;
      }
      
      .horizon-area {
        transition: opacity 0.2s ease;
      }
      
      .axis-label {
        font-size: 14px;
        font-weight: bold;
        fill: var(--color-black);
      }
      
      .year-label {
        font-size: 11px;
        fill: var(--color-gray-500);
      }
      
      .tag-label {
        font-size: 13px;
        font-weight: bold;
        fill: var(--color-black);
      }
      
      .grid-line {
        stroke: var(--color-gray-300);
        stroke-dasharray: 2, 2;
      }
    </style>

    <div>
      <h1>Timeline des tags</h1>
      <p>Ce graphe montre l'évolution du nombre de fiches mentionnant chaque tag au fil du temps. Plus la courbe est haute, plus le tag est cité pour cette année.</p>
      
      <div class="timeline-container">
        <svg width="${width}" height="${svgHeight}" viewBox="0 0 ${width} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
          ${svgContent}
        </svg>
      </div>
    </div>
  `;
}

import * as d3 from 'd3';

/**
 * Configuration par défaut pour les timelines
 */
const DEFAULT_CONFIG = {
  rowHeight: 40,
  rowGap: 5,
  innerWidth: 1000,
  tickCount: 10,
};

/**
 * Génère les données agrégées par année pour une timeline
 * @param {Object} options
 * @param {Array} options.dates - Données de dates avec records
 * @param {Array} options.items - Liste des items à afficher (tags, livres, etc.)
 * @param {Map} options.itemRecordsMap - Map item -> Set d'IDs de records
 * @returns {Object} { timelineData, minYear, maxYear }
 */
function aggregateYearlyData({ dates, items, itemRecordsMap }) {
  const yearlyData = new Map();

  for (const dateEntry of dates) {
    const year = dateEntry.date.year;
    if (!yearlyData.has(year)) {
      yearlyData.set(year, {});
      for (const item of items) {
        yearlyData.get(year)[item] = 0;
      }
    }

    for (const record of dateEntry.records) {
      for (const item of items) {
        if (itemRecordsMap.get(item)?.has(record.id)) {
          yearlyData.get(year)[item]++;
        }
      }
    }
  }

  const sortedYears = Array.from(yearlyData.keys()).sort((a, b) => a - b);
  const timelineData = sortedYears.map((year) => ({
    year,
    ...yearlyData.get(year),
  }));

  const years = timelineData.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return { timelineData, minYear, maxYear };
}

/**
 * Génère les ticks pour l'axe X
 * @param {number} minYear
 * @param {number} maxYear
 * @param {number} tickCount
 * @returns {Array<number>}
 */
function generateXTicks(
  minYear,
  maxYear,
  tickCount = DEFAULT_CONFIG.tickCount
) {
  const tickStep = Math.ceil((maxYear - minYear) / tickCount);
  const xTicks = [];
  for (let y = minYear; y <= maxYear; y += tickStep) {
    xTicks.push(y);
  }
  return xTicks;
}

/**
 * Génère le SVG pour une ligne de timeline
 * @param {Object} options
 * @param {Array} options.timelineData - Données de la timeline
 * @param {string} options.item - Nom de l'item
 * @param {number} options.maxValue - Valeur maximale pour l'échelle Y
 * @param {Array} options.xTicks - Ticks pour les lignes de grille
 * @param {Object} options.config - Configuration (rowHeight, innerWidth)
 * @returns {string} HTML du SVG
 */
function generateRowSvg({ timelineData, item, maxValue, xTicks, config }) {
  const { rowHeight, innerWidth } = config;

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(timelineData, (d) => d.year))
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear().domain([0, maxValue]).range([rowHeight, 0]);

  const area = d3
    .area()
    .x((d) => xScale(d.year))
    .y0(rowHeight)
    .y1((d) => yScale(d[item]))
    .curve(d3.curveMonotoneX);

  const pathD = area(timelineData);

  let gridLines = '';
  for (const tick of xTicks) {
    const x = xScale(tick);
    gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${rowHeight}" class="grid-line" />`;
  }

  return `
    <svg class="timeline-svg" viewBox="0 0 ${innerWidth} ${rowHeight}" preserveAspectRatio="none">
      ${gridLines}
      <line x1="0" y1="${rowHeight}" x2="${innerWidth}" y2="${rowHeight}" class="base-line" />
      <path d="${pathD}" fill="var(--color-gray-800)" />
    </svg>
  `;
}

/**
 * Génère les styles CSS pour la timeline
 * @param {Object} config
 * @returns {string}
 */
function generateStyles(config) {
  const { rowHeight, rowGap } = config;

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
      
      .timeline-label {
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
  `;
}

/**
 * Génère l'axe X de la timeline
 * @param {Array} xTicks
 * @param {number} minYear
 * @param {number} maxYear
 * @returns {string}
 */
function generateAxisHtml(xTicks, minYear, maxYear) {
  let axisHtml =
    '<div class="timeline-axis" x-ref="axis" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">';

  for (const tick of xTicks) {
    const percent = ((tick - minYear) / (maxYear - minYear)) * 100;
    axisHtml += `<span class="year-tick" style="left: ${percent}%">${tick}</span>`;
  }

  axisHtml += `<span x-show="currentYear" class="current-year" x-text="currentYear" :style="'transform: translateX(' + barPosition + 'px)'"></span>`;
  axisHtml += '</div>';

  return axisHtml;
}

/**
 * Génère une timeline complète
 * @param {Object} options
 * @param {string} options.title - Titre de la page
 * @param {string} options.description - Description de la timeline
 * @param {Array} options.dates - Données de dates
 * @param {Array} options.recordsGrouped - Données groupées (records_by_tag, records_by_book, etc.)
 * @param {Array} [options.itemsFilter] - Liste optionnelle d'items à afficher (si non fourni, tous sont affichés)
 * @param {Function} options.formatLabel - Fonction pour formater le label d'un item
 * @param {string} options.alpineComponent - Nom du composant Alpine.js
 * @param {string} options.countMethod - Nom de la méthode Alpine pour afficher le count
 * @param {Object} [options.config] - Configuration optionnelle
 * @returns {string} HTML complet de la timeline
 */
export function generateTimeline({
  title,
  description,
  dates,
  recordsGrouped,
  itemsFilter = null,
  formatLabel = (item) => item,
  alpineComponent = 'tagsTimeline',
  countMethod = 'getCountForItem',
  config = {},
}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Créer un map des records par item
  const itemRecordsMap = new Map();
  const itemsToDisplay = [];

  for (const groupData of recordsGrouped) {
    const key = groupData.key;
    if (!key || !groupData.records || groupData.records.length === 0) continue;

    // Si un filtre est fourni, ne garder que les items du filtre
    if (itemsFilter && !itemsFilter.includes(key)) continue;

    itemRecordsMap.set(key, new Set(groupData.records.map((r) => r.id)));
    itemsToDisplay.push(key);
  }

  // Conserver l'ordre du filtre si fourni
  const orderedItems = itemsFilter
    ? itemsFilter.filter((item) => itemsToDisplay.includes(item))
    : itemsToDisplay;

  // Agréger les données
  const { timelineData, minYear, maxYear } = aggregateYearlyData({
    dates,
    items: orderedItems,
    itemRecordsMap,
  });

  // Calculer les valeurs max pour chaque item
  const maxValues = {};
  for (const item of orderedItems) {
    maxValues[item] = Math.max(...timelineData.map((d) => d[item]), 1);
  }

  // Générer les ticks X
  const xTicks = generateXTicks(minYear, maxYear, mergedConfig.tickCount);

  // Générer les lignes HTML
  let rowsHtml = '';
  for (const item of orderedItems) {
    const label = formatLabel(item);
    const svgHtml = generateRowSvg({
      timelineData,
      item,
      maxValue: maxValues[item],
      xTicks,
      config: mergedConfig,
    });

    rowsHtml += `
      <div class="timeline-row">
        <div class="timeline-label">
          ${label}<span x-text="${countMethod}('${item}')"></span>
        </div>
        <div class="timeline-svg-container">
          ${svgHtml}
        </div>
      </div>
    `;
  }

  const axisHtml = generateAxisHtml(xTicks, minYear, maxYear);
  const stylesHtml = generateStyles(mergedConfig);

  return `
    ${stylesHtml}

    <div x-data='${alpineComponent}(${JSON.stringify(timelineData)}, ${minYear}, ${maxYear}, ${JSON.stringify(orderedItems)})'>
      <h1>${title}</h1>
      <p>${description}</p>
      
      <div class="timeline-container" x-ref="container">
        ${rowsHtml}
        ${axisHtml}
      </div>
      
      <div x-show="showBar" class="comparison-bar" :style="'transform: translateX(' + barPosition + 'px)'"></div>
    </div>
  `;
}

/**
 * Formatte un slug en label lisible (capitalize + remplace tirets par espaces)
 * @param {string} slug
 * @returns {string}
 */
export function formatSlugAsLabel(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
}

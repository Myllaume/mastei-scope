export const data = {
  layout: 'base.liquid',
  title: 'Graphe des tags',
};

const TAGS_IN_CIRCLE = [
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
  const recordsByTag = data.records_by_tag;

  const tagRecordsMap = new Map();
  for (const tagData of recordsByTag) {
    if (TAGS_IN_CIRCLE.includes(tagData.key)) {
      tagRecordsMap.set(tagData.key, new Set(tagData.records.map((r) => r.id)));
    }
  }

  const links = [];
  const tagKeys = Array.from(tagRecordsMap.keys());

  for (let i = 0; i < tagKeys.length; i++) {
    for (let j = i + 1; j < tagKeys.length; j++) {
      const tag1 = tagKeys[i];
      const tag2 = tagKeys[j];
      const records1 = tagRecordsMap.get(tag1);
      const records2 = tagRecordsMap.get(tag2);

      const commonRecords = [...records1].filter((r) => records2.has(r));
      const count = commonRecords.length;

      if (count > 0) {
        links.push({
          source: tag1,
          target: tag2,
          weight: count,
        });
      }
    }
  }

  const centerX = 400;
  const centerY = 400;
  const radius = 300;
  const nodeRadius = 20;

  const nodes = tagKeys.map((tag, index) => {
    const angle = (2 * Math.PI * index) / tagKeys.length - Math.PI / 2;
    return {
      id: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' '),
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const nodePositions = new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));

  const maxWeight = Math.max(...links.map((l) => l.weight), 1);
  const minWeight = Math.min(...links.map((l) => l.weight), 1);
  const normalizeWeight = (w) => {
    if (maxWeight === minWeight) return 3;
    return 1 + ((w - minWeight) / (maxWeight - minWeight)) * 9;
  };

  const svgWidth = 800;
  const svgHeight = 800;

  let svgContent = '';

  for (const link of links) {
    const source = nodePositions.get(link.source);
    const target = nodePositions.get(link.target);
    const strokeWidth = normalizeWeight(link.weight);

    // Calculer le point de contrôle pour la courbe de Bézier
    // Point milieu entre source et target
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    // Vecteur du milieu vers le centre
    const toCenter = {
      x: centerX - midX,
      y: centerY - midY,
    };

    const curveGravity = 0.25;
    const controlPoint = {
      x: midX + toCenter.x * curveGravity,
      y: midY + toCenter.y * curveGravity,
    };

    svgContent += `<path
      d="M ${source.x},${source.y} Q ${controlPoint.x},${controlPoint.y} ${target.x},${target.y}"
      stroke="var(--color-black)"
      stroke-width="${strokeWidth.toFixed(1)}"
      fill="none"
      data-source="${link.source}"
      data-target="${link.target}"
      data-count="${link.weight}"
    >
      <title>${link.source} ↔ ${link.target}: ${link.weight} fiche(s) en commun</title>
    </path>`;
  }

  for (const node of nodes) {
    const recordCount = tagRecordsMap.get(node.id)?.size || 0;

    // Calculer les relations pour ce nœud
    const connectedNodes = new Set();
    const connectedLinks = links.filter((link) => {
      if (link.source === node.id || link.target === node.id) {
        if (link.source === node.id) connectedNodes.add(link.target);
        if (link.target === node.id) connectedNodes.add(link.source);
        return true;
      }
      return false;
    });

    const relationCount = connectedLinks.length;

    svgContent += `<g class="node" data-tag="${node.id}"
      x-on:mouseenter="highlightNode('${node.id}', true)"
      x-on:mouseleave="highlightNode('${node.id}', false)"
    >
      <circle
        cx="${node.x}" cy="${node.y}"
        r="${nodeRadius}"
      />
      <text
        x="${node.x}" y="${node.y + nodeRadius + 20}"
        text-anchor="middle"
        font-size="14"
        font-weight="bold"
        fill="#333"
      >${node.label}</text>
      <text
        x="${node.x}" y="${node.y + 5}"
        text-anchor="middle"
        font-size="12"
        fill="#fff"
      >${recordCount}</text>
      <title>${node.label}: ${recordCount} fiche(s) • ${relationCount} relation(s)</title>
    </g>`;
  }

  return `
    <style>
      path {
        stroke: var(--color-gray-500);
        transition: all 0.2s ease;
      }

      path.highlighted-link {
        stroke: var(--color-highlight);
        opacity: 1;
      }

      .node circle {
        fill: var(--color-black);
        transition: all 0.2s ease;
      }

      .node.highlighted-node circle {
        fill: var(--color-highlight);
      }
    </style>

    <div>
      <h1>Graphe des relations entre tags</h1>
      <p>Ce graphe montre les relations entre les pays/régions. Un lien existe entre deux tags s'ils partagent au moins une fiche. Plus le lien est épais, plus il y a de fiches en commun.</p>
      
      <svg
        x-data="tagsGraph()"
        width="100%" 
        height="${svgHeight}" 
        viewBox="0 0 ${svgWidth} ${svgHeight}" 
        xmlns="http://www.w3.org/2000/svg"
      >
        ${svgContent}
      </svg>
    </div>
  `;
}

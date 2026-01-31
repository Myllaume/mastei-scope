import Graph from 'graphology';

export const data = {
  layout: 'base.liquid',
  title: 'Graphe des personnes',
};

export default function (data) {
  // Importer le graphe avec Graphology
  const fullGraph = new Graph();
  fullGraph.import(data.graph);

  // Récupérer la liste des personnes (fiches avec le tag "personne")
  const recordsByTag = data.records_by_tag;
  const personneTag = recordsByTag.find((tag) => tag.key === 'personne');

  if (!personneTag) {
    return '<p>Aucune personne trouvée.</p>';
  }

  const personneIds = new Set(personneTag.records.map((r) => r.id));
  const personneMap = new Map(personneTag.records.map((r) => [r.id, r.title]));

  // Vérifier combien de personnes sont dans le graphe
  let personnesInGraph = 0;
  for (const personneId of personneIds) {
    if (fullGraph.hasNode(personneId)) {
      personnesInGraph++;
    }
  }

  // Pour chaque fiche non-personne, trouver toutes les personnes qui y sont liées
  // Puis créer des liens entre ces personnes
  const recordToPersonnes = new Map(); // recordId (non-personne) -> Set of personneIds

  fullGraph.forEachNode((nodeId) => {
    // Si ce n'est pas une personne, chercher les personnes voisines
    if (!personneIds.has(nodeId)) {
      const neighbors = fullGraph.neighbors(nodeId);
      const personneNeighbors = neighbors.filter((n) => personneIds.has(n));
      if (personneNeighbors.length > 1) {
        // Au moins 2 personnes pour créer un lien
        recordToPersonnes.set(nodeId, new Set(personneNeighbors));
      }
    }
  });

  // Créer le graphe des personnes
  const peopleGraph = new Graph();

  // Ajouter tous les nœuds personnes
  for (const personneId of personneIds) {
    if (fullGraph.hasNode(personneId)) {
      peopleGraph.addNode(personneId, {
        label: personneMap.get(personneId) || personneId,
      });
    }
  }

  // Créer les liens entre personnes via les fiches communes
  for (const [recordId, personnes] of recordToPersonnes) {
    const personneArray = Array.from(personnes);
    // Pour chaque paire de personnes liées à cette fiche
    for (let i = 0; i < personneArray.length; i++) {
      for (let j = i + 1; j < personneArray.length; j++) {
        const p1 = personneArray[i];
        const p2 = personneArray[j];

        const edgeKey = [p1, p2].sort().join('--');
        if (peopleGraph.hasEdge(edgeKey)) {
          // Incrémenter le poids
          const currentWeight = peopleGraph.getEdgeAttribute(edgeKey, 'weight');
          peopleGraph.setEdgeAttribute(edgeKey, 'weight', currentWeight + 1);
        } else {
          peopleGraph.addEdgeWithKey(edgeKey, p1, p2, { weight: 1 });
        }
      }
    }
  }

  // Construire la liste des liens pour le rendu
  const links = [];
  peopleGraph.forEachEdge((edge, attr, source, target) => {
    links.push({
      source,
      target,
      weight: attr.weight || 1,
    });
  });

  // Filtrer les personnes qui n'ont aucun lien (isolées)
  const connectedPersonnes = new Set();
  for (const link of links) {
    connectedPersonnes.add(link.source);
    connectedPersonnes.add(link.target);
  }

  // Configuration du graphe
  const centerX = 400;
  const centerY = 400;
  const radius = 350;
  const nodeRadius = 8;

  // Créer les nœuds (uniquement les personnes connectées)
  const connectedPersonneArray = Array.from(connectedPersonnes);
  const nodes = connectedPersonneArray.map((personneId, index) => {
    const angle =
      (2 * Math.PI * index) / connectedPersonneArray.length - Math.PI / 2;
    return {
      id: personneId,
      label: personneMap.get(personneId) || personneId,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const nodePositions = new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));

  // Normaliser l'épaisseur des liens
  const maxWeight = Math.max(...links.map((l) => l.weight), 1);
  const minWeight = Math.min(...links.map((l) => l.weight), 1);
  const normalizeWeight = (w) => {
    if (maxWeight === minWeight) return 2;
    return 0.5 + ((w - minWeight) / (maxWeight - minWeight)) * 4;
  };

  const svgWidth = 800;
  const svgHeight = 800;

  let svgContent = '';

  // Dessiner les liens (edges)
  for (const link of links) {
    const source = nodePositions.get(link.source);
    const target = nodePositions.get(link.target);

    if (!source || !target) continue;

    const strokeWidth = normalizeWeight(link.weight);

    // Calculer le point de contrôle pour la courbe de Bézier
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    // Vecteur du milieu vers le centre
    const toCenter = {
      x: centerX - midX,
      y: centerY - midY,
    };

    const curveGravity = 0.3;
    const controlPoint = {
      x: midX + toCenter.x * curveGravity,
      y: midY + toCenter.y * curveGravity,
    };

    const sourceName = personneMap.get(link.source) || link.source;
    const targetName = personneMap.get(link.target) || link.target;

    svgContent += `<path
      class="edge"
      d="M ${source.x},${source.y} Q ${controlPoint.x},${controlPoint.y} ${target.x},${target.y}"
      stroke="var(--color-gray-500)"
      stroke-width="${strokeWidth.toFixed(1)}"
      fill="none"
      data-source="${link.source}"
      data-target="${link.target}"
      data-count="${link.weight}"
    >
      <title>${sourceName} ↔ ${targetName}: ${link.weight} fiche(s) en commun</title>
    </path>`;
  }

  // Dessiner les nœuds (personnes)
  for (const node of nodes) {
    const connectionCount =
      links.filter((l) => l.source === node.id || l.target === node.id)
        .length || 0;

    svgContent += `<g class="node" data-person="${node.id}"
      x-on:mouseenter="highlightNode('${node.id}', true)"
      x-on:mouseleave="highlightNode('${node.id}', false)"
    >
      <a href="/records/${node.id}/">
        <circle
          cx="${node.x}" cy="${node.y}"
          r="${nodeRadius}"
        />
        <text
          x="${node.x}" y="${node.y + nodeRadius + 14}"
          text-anchor="middle"
          font-size="9"
          fill="#333"
        >${node.label}</text>
      </a>
      <title>${node.label}: ${connectionCount} relation(s)</title>
    </g>`;
  }

  return `
    <style>
      .edge {
        stroke: var(--color-gray-500);
        transition: all 0.2s ease;
        opacity: 0.4;
      }

      .edge.highlighted-link {
        stroke: var(--color-highlight);
        opacity: 1;
      }

      .node circle {
        fill: var(--color-black);
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .node:hover circle {
        fill: var(--color-highlight);
      }

      .node.highlighted-node circle {
        fill: var(--color-highlight);
      }

      .node text {
        pointer-events: none;
      }

      .node a {
        text-decoration: none;
      }
    </style>

    <div>
      <h1>Graphe des personnes</h1>
      <p>Ce graphe montre les relations entre les personnes. Deux personnes sont liées si elles apparaissent dans une fiche commune (ou sont liées à une même fiche). Plus le lien est épais, plus il y a de fiches en commun.</p>
      <p><strong>${connectedPersonneArray.length}</strong> personnes affichées (sur ${personneIds.size} au total), <strong>${links.length}</strong> liens.</p>
      
      <svg
        x-data="peopleGraph()"
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

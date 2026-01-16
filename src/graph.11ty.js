import Graph from 'graphology';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import noverlap from 'graphology-layout-noverlap';

export const data = {
  layout: 'base.liquid',
  title: 'Graphe',
};

export default function (data) {
  const graph = new Graph();
  graph.import(data.graph);

  // Step 1: Circular layout
  const positionsCircular = circular(graph, { scale: 250 });

  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      x: positionsCircular[node].x,
      y: positionsCircular[node].y,
    };
  });

  // Step 2: Force Atlas 2
  const positionsAtlas = forceAtlas2(graph, {
    iterations: 150,
    settings: forceAtlas2.inferSettings(graph),
  });

  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      x: positionsAtlas[node].x,
      y: positionsAtlas[node].y,
    };
  });

  // Step 3: Overlap removal
  const positionsNoverlap = noverlap(graph, {
    maxIterations: 50,
    settings: {
      ratio: 50,
    },
  });

  graph.updateEachNodeAttributes((node, attr) => {
    return {
      ...attr,
      x: positionsNoverlap[node].x,
      y: positionsNoverlap[node].y,
    };
  });

  // Calculate bounds for SVG viewBox
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  graph.forEachNode((node, attr) => {
    minX = Math.min(minX, attr.x);
    minY = Math.min(minY, attr.y);
    maxX = Math.max(maxX, attr.x);
    maxY = Math.max(maxY, attr.y);
  });

  const padding = 50;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  // Generate SVG
  let svgContent = '';

  // Draw edges
  graph.forEachEdge((edge, attr, source, target) => {
    const sourceAttr = graph.getNodeAttributes(source);
    const targetAttr = graph.getNodeAttributes(target);
    svgContent += `<line x1="${sourceAttr.x - minX + padding}" y1="${sourceAttr.y - minY + padding}" x2="${targetAttr.x - minX + padding}" y2="${targetAttr.y - minY + padding}" stroke="#ccc" stroke-width="1" opacity="0.6" />`;
  });

  // Draw nodes
  graph.forEachNode((node, attr) => {
    const x = attr.x - minX + padding;
    const y = attr.y - minY + padding;
    const color = attr.color || '#000';
    const label = attr.label || node;

    svgContent += `<circle cx="${x}" cy="${y}" r="5" fill="${color}" stroke="#fff" stroke-width="1" />`;
    // svgContent += `<text x="${x}" y="${y - 10}" text-anchor="middle" font-size="10" fill="#333">${label}</text>`;
  });

  return `
    <h1>Graphe des enregistrements</h1>
    <svg width="100%" height="800" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${svgContent}
    </svg>
  `;
}

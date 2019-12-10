import getNeighbors from './utils/getNeighbors.js';

import baseNodes from './data/nodes.js';
import baseLinks from './data/links.js';

let nodes = [...baseNodes];
let links = [...baseLinks];

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
  .select('div#main')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

let linkElements, nodeElements, textElements;

// we use svg groups to logically group the elements together
const linkGroup = svg.append('g').attr('class', 'links');
const nodeGroup = svg.append('g').attr('class', 'nodes');
const textGroup = svg.append('g').attr('class', 'texts');

// we use this reference to select/deselect
// after clicking the same element twice
let selectedId;

// simulation setup with all forces
const linkForce = d3
  .forceLink()
  .id(link => link.id)
  .strength(link => link.strength);

const simulation = d3
  .forceSimulation()
  .force('link', linkForce)
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(width / 2, height / 2));

const dragDrop = d3
  .drag()
  .on('start', node => {
    node.fx = node.x;
    node.fy = node.y;
  })
  .on('drag', node => {
    simulation.alphaTarget(0.7).restart();
    node.fx = d3.event.x;
    node.fy = d3.event.y;
  })
  .on('end', node => {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    node.fx = null;
    node.fy = null;
  });

// select node is called on every click
// we either update the data according to the selection
// or reset the data if the same node is clicked twice
function selectNode(selectedNode) {
  if (selectedId === selectedNode.id) {
    selectedId = undefined;
    resetData();
    updateSimulation();
  } else {
    selectedId = selectedNode.id;
    updateData(selectedNode);
    updateSimulation();
  }

  // const neighbors = getNeighbors(selectedNode, baseLinks);

  // // we modify the styles to highlight selected nodes
  // nodeElements.attr('fill', node => getNodeColor(node, neighbors));
  // textElements.attr('fill', node => getTextColor(node, neighbors));
  // linkElements.attr('stroke', link => getLinkColor(selectedNode, link));
}

// this helper simple adds all nodes and links
// that are missing, to recreate the initial state
function resetData() {
  const nodeIds = nodes.map(node => node.id);

  baseNodes.forEach(node => {
    if (nodeIds.indexOf(node.id) === -1) {
      nodes.push(node);
    }
  });

  links = baseLinks;
}

// diffing and mutating the data
function updateData(selectedNode) {
  const neighbors = getNeighbors(selectedNode, baseLinks);
  const newNodes = baseNodes.filter(
    node => neighbors.indexOf(node.id) > -1 || node.level === 1
  );

  const diff = {
    removed: nodes.filter(node => newNodes.indexOf(node) === -1),
    added: newNodes.filter(node => nodes.indexOf(node) === -1)
  };

  diff.removed.forEach(node => nodes.splice(nodes.indexOf(node), 1));
  diff.added.forEach(node => nodes.push(node));

  links = baseLinks.filter(
    link =>
      link.target.id === selectedNode.id || link.source.id === selectedNode.id
  );
}

let defs = svg.append('defs');
defs
  .append('marker')
  .attrs({
    id: 'arrow',
    viewBox: '0 -5 10 10',
    refX: 15,
    refY: -1.5,
    markerWidth: 15,
    markerHeight: 15,
    orient: 'auto'
  })
  .append('path')
  .attrs({
    d: 'M0,-5L10,0L0,5',
    fill: '#f00'
  });

function updateGraph() {
  // links
  linkElements = linkGroup
    .selectAll('path')
    .data(links, link => link.target.id + link.source.id);
  linkElements.exit().remove();

  const linkEnter = linkElements
    .enter()
    .append('path')
    .attrs({
      'stroke-width': 1,
      stroke: 'rgba(50, 50, 50, 1)',
      'marker-end': 'url(#arrow)'
    });

  linkElements = linkEnter.merge(linkElements);

  // nodes
  nodeElements = nodeGroup.selectAll('circle').data(nodes, node => node.id);
  nodeElements.exit().remove();

  const nodeEnter = nodeElements
    .enter()
    .append('circle')
    .attr('r', 10)
    .call(dragDrop)
    .on('click', selectNode);

  nodeElements = nodeEnter.merge(nodeElements);

  // texts
  textElements = textGroup.selectAll('text').data(nodes, node => node.id);
  textElements.exit().remove();

  const textEnter = textElements
    .enter()
    .append('text')
    .text(node => node.label)
    .attrs({
      'font-size': 15,
      dx: 15,
      dy: 4
    });

  textElements = textEnter.merge(textElements);
}

function updateSimulation() {
  updateGraph();

  simulation.nodes(nodes).on('tick', () => {
    nodeElements.attr('cx', node => node.x).attr('cy', node => node.y);
    textElements.attr('x', node => node.x).attr('y', node => node.y);
    linkElements.attr('d', linkArc);
  });

  simulation.force('link').links(links);
  simulation.restart();
}

function linkArc(d) {
  var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = Math.sqrt(dx * dx + dy * dy);

  return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
}

// updateSimulation();
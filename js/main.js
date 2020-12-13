"use strict";

//configurations
const nodeValues = {
  'radius' : 20
}
const colors = [
  "#fff8ac",
  "#ddffac",
  "#b3ffac",
  "#acffcf",
  "#acfff8",
  "#acddff"
]

//local selections
const nodes = [];
const links = [];
const force = d3.forceSimulation()
  .force('link', d3.forceLink().distance(100));
const mySvg = d3.select("#main");
let vertices = mySvg.selectAll('.node');
let edges = mySvg.selectAll('.link');

//local state variables
let selectedNodeIndex = null;


//functions for dynamic interaction
const addNode = (e) => {
  const coordinates = d3.pointer(e);
  const newNode = { x: coordinates[0], y: coordinates[1], id: nodes.length };
  nodes.push(newNode);
  update();
}

const deleteNode = (e, d) => {
  e.preventDefault();
  nodes.splice(d.index, 1);
  update();
}

/**
 * @desc A funtion that is called when a mouse drag is detected from another node
 * @param e - the event object
 *        d - the datum of the node that triggered the mouseup event
 */
const addEdge = (e, d) => {
  console.debug('addEdge');
  const newLink = { source: selectedNodeIndex, target: d.index };
  links.push(newLink);
  turnOffAddEdge();
  turnOnStartAddEdge();

  update();
}

const startAddEdge = (e, d) => {
  console.debug("startAddEdge");
  selectedNodeIndex = d.index;
  //add a listener to every node but the current one so that addEdge
  //is not called when user releases mouse over selected edge
  mySvg.selectAll('.node')
    .filter((d) => {
      return(selectedNodeIndex != d.index)
    })
    .on('click.addEdge', addEdge)
    .on('click.startAddEdge', null);
}

// interface on/off functions
const turnOffAddNode = () => {
  mySvg.on('click.addNode', null);
}
const turnOnAddNode = () => {
  mySvg.on('click.addNode', addNode);
}

const turnOnAddEdgeStateListener = () => {
  mySvg.on('click.addEdgeState', turnOffAddEdge);
}
const turnOffAddEdgeStateListener = () => {
  mySvg.on('click.addEdgeState', null);
}

const turnOnStartAddEdge = () => {
  mySvg.selectAll('.node')
    .on('click.startAddEdge', startAddEdge);
}
const turnOffStartAddEdge = () => {
  mySvg.selectAll('.node')
    .on('click.startAddEdge', null);
}

const turnOnAddEdge = () => {
  mySvg.selectAll('.node')
    .on('click.addEdge', addEdge);
}
const turnOffAddEdge = () => {
  mySvg.selectAll('.node')
    .on('click.addEdge', null);
}

const turnOffDefault = (e) => {
  e.preventDefault();
}

// interface listeners
// more interface listeners within update function
turnOnAddNode();
turnOnAddEdgeStateListener();

// update graph visualization with svg drawings
const update = () => {
  edges = mySvg.selectAll('.link').data(links);
  edges.exit().remove();
  const edgesEnter = edges
    .enter().append('line')
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; })
      .attr('class', 'link')
      .attr('stroke', 'white')
      .attr('stroke-width', '3');

  // add all edges to global selection
  edges = edgesEnter.merge(edges);

  vertices = mySvg.selectAll('.node').data(nodes);
  vertices.exit().remove();
  const verticesEnter = vertices
    .enter().append('circle')
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; })
      .attr('class', 'node')
      .attr('id', (d) => {return(d.id)})
      .attr('r', nodeValues.radius)
      .style('fill', (d) => {
        return colors[d.id % 6];
      })
      // interface listeners
      .on('click.startAddEdge', startAddEdge)
      .on('auxclick', deleteNode) 
      .on('contextmenu', turnOffDefault)
      // turn of listener for add node so that new node is not created
      .on('mouseover.addNode', turnOffAddNode)
      .on('mouseout.addNode', turnOnAddNode)
      .on('mouseover.addEdgeState', turnOffAddEdgeStateListener)
      .on('mouseout.addEdgeState', turnOnAddEdgeStateListener);

  // add all vertices to gobal selection
  // This is important for the updating of positions
  vertices = verticesEnter.merge(vertices);

  force.nodes(nodes);
  force.force("link").links(links);
  force
    .alpha(1)
    .restart();
}


const tick = (e) => {
  edges.attr('x1', function(d) { return d.source.x; })
       .attr('y1', function(d) { return d.source.y; })
       .attr('x2', function(d) { return d.target.x; })
       .attr('y2', function(d) { return d.target.y; });
  vertices.attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
}

force.on('tick', tick);


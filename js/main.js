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
  console.log("nodes", nodes);
  const coordinates = d3.pointer(e);
  console.log("coord", coordinates);
  const newNode = { x: coordinates[0], y: coordinates[1], id: nodes.length };
  nodes.push(newNode);
  update();
}

const deleteNode = (e, d) => {
  console.debug("delete Node");
}

/**
 * @desc A funtion that is called when a mouse drag is detected from another node
 * @param e - the event object
 *        d - the datum of the node that triggered the mouseup event
 */
const addEdge = (e, d) => {
  const newLink = { source: selectedNodeIndex, target: d.index };
  links.push(newLink);
  update();

  turnOffAddEdge();
}

const startAddEdge = (e, d) => {
  selectedNodeIndex = d.id;
  //add a listener to every node but the current one so that addEdge
  //is not called when user releases mouse over selected edge
  mySvg.selectAll('.node')
    .filter((d) => {
      return(selectedNodeIndex != d.index)
    })
    .on('mouseup.addEdge', addEdge);
}

// interface on/off functions
const turnOffAddNode = () => {
  mySvg.on('mousedown', null);
}

const turnOnAddNode = () => {
  mySvg.on('mousedown', addNode);
}

const turnOnAddEdge = () => {
  mySvg.selectAll('.node')
    .on('mouseup.addEdge', addEdge);
}

const turnOffAddEdge = () => {
  mySvg.selectAll('.node')
    .on('mouseup.addEdge', null);
}

const turnOffDefault = (e) => {
  e.preventDefault();
}

//listener for dynamic interaction
turnOnAddNode();
mySvg.on('mouseup', turnOffAddEdge);

// update graph visualization with svg drawings
const update = () => {
  edges = mySvg.selectAll('.link').data(links);
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
      .on('mousedown', startAddEdge)
      .on('auxclick', deleteNode) 
      .on('contextmenu', turnOffDefault)
      // turn of listener for add node so that new node is not created
      .on('mouseover.addNode', turnOffAddNode)
      .on('mouseout.addNode', turnOnAddNode);

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


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
const force = d3.forceSimulation();
const mySvg = d3.select("#main");
let node = mySvg.selectAll('.node');

//local state variables
let addingEdge = 0;

//functions for dynamic interaction
const addNode = (e) => {
  const nodes = force.nodes();
  //console.log("nodes", nodes);
  const coordinates = d3.pointer(e);
  //console.log("coord", coordinates);
  const newNode = { x: coordinates[0], y: coordinates[1], id: nodes.length };
  nodes.push(newNode);
  force.nodes(nodes);
  update();
  //console.log(node);
}

const addEdge = (e) => {
  if(addingEdge){
    console.log("add edge");
    addingEdge = 0;
  }
  turnOffAddEdge();
}

const startAddEdge = (e, d) => {
  addingEdge = 1;
  //TODO add filter function here to excluded selected node
  const selectedNodeId = d.id;
  console.log("selected Node id", selectedNodeId);
  mySvg.selectAll('.node')
    .filter((d) => {
      return(selectedNodeId != d.id)
    })
      .on('mouseup.addEdge', addEdge);
}

const turnOffAddNode = () => {
  mySvg.on('mousedown', null);
}

const turnOnAddNode = () => {
  mySvg.on('mousedown', addNode);
}

const turnOnAddEdge = () => {
  node = mySvg.selectAll('.node')
    .on('mouseup.addEdge', addEdge);
}

const turnOffAddEdge = () => {
  mySvg.selectAll('.node')
    .on('mouseup.addEdge', null);
}

//listener for dynamic interaction
turnOnAddNode();
mySvg.on('mouseup', turnOffAddEdge);

// update graph visualization with svg drawings
const update = () => {
  node = mySvg.selectAll('.node')
    .data(force.nodes())
    .enter().append('circle')
    .attr('class', 'node')
    .attr('id', (d) => {return(d.id)})
    .attr('r', nodeValues.radius)
    .style('fill', (d) => {
      return colors[d.id % 6];
    })
    .on('mousedown', startAddEdge)
  //turn of listener for add node so that new node is not created
    .on('mouseover.addNode', turnOffAddNode)
    .on('mouseout.addNode', turnOnAddNode)
  force.restart();
}


const tick = (e) => {
  node.attr('cx', function(d) {
    return d.x;
  });
  node.attr('cy', function(d) { return d.y; });
}

force.on('tick', tick);






//const tick = (e) => {
//
//}
































//const addVertex = (myEvent) => {
//  myVertexSet.push(myVertexSet.length+1);
//  console.debug("myVertexSet", myVertexSet);
//  const coordinates = d3.pointer(myEvent);
//  const newVertex = d3.select("g")
//
//  newVertex.append("circle")
//    .attr('cx', coordinates[0])
//    .attr('cy', coordinates[1])
//    .attr('r', 20)
//    .attr('fill', 'white')
//    .attr('stroke', 'black');
//  newVertex.append("text")
//    .attr('x', coordinates[0])
//    .attr('y', coordinates[1])
//    .attr('text-anchor', 'middle')
//    .style('color', 'white')
//    .html("hello");
//
//  mySvg.append(newVertex);
//}

//mySvg.on("click", addVertex);





//const myVertex = mySvg.data(myVertexSet)
//  .data(myEdgeSet)
//  .append("g");



//myVertex.append("circle")
//  .attr('cx', 50)
//  .attr('cy', 50)
//  .attr('r', 20);
//
//myVertex.append("text")
//  .attr('x', "50")
//  .attr('y', "50")
//  .attr("text-anchor", "middle")
//  .html("hello");


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
  .force('link', d3.forceLink().distance(0).strength(0));
const mySvg = d3.select("#main");
let vertices = mySvg.selectAll('.node');
let edges = mySvg.selectAll('.link');

//local state variables
let selectedNodeIndex = null;

// drag functionality
mySvg
  .call(drag(force));

const dragstarted = (dragEvent) => {
  const node = d3.select(this);

  dragEvent.on('drag', dragged);

  function dragged(event, d) {
      node
        .attr("cx", d.x = dragEvent.x)
        .attr("cy", d.y = dragEvent.y);
    }
}

//functions for dynamic interaction
const addNode = (e) => {
  const coordinates = d3.pointer(e);
  const newNode = { x: coordinates[0], y: coordinates[1], id: nodes.length, links: [] };
  nodes.push(newNode);
  update();
}

//is deleted its incident edges can let there incident nodes know.
const deleteNode = (e, d) => {
  e.preventDefault();
  const deletedNodes = nodes.splice(d.index, 1);
  const deletedNode = deletedNodes[0];

    //delete incident edges
  if(deletedNode.links.length > 0){
    //sort edges to be deleted in descending order
    //this way the change in indices of the links array won't affect the
    //accuracy.
    const linksSorted = deletedNode.links.sort( (a,b) => { return(a.index-b.index); } );
    const linksSortedLength = linksSorted.length;
    for(let i = 0; i < linksSortedLength; i++) {
      const link = linksSorted[i];
      const sourceNode = link.source;
      const targetNode = link.target;
      if(sourceNode != deletedNode){
        sourceNode.links.splice(sourceNode.links.indexOf(link), 1);
      }else{
        targetNode.links.splice(targetNode.links.indexOf(link), 1);
      }

      links.splice(link.index, 1);
      // update link objects so that there index property is accurate.
      force.force("link").links(links);
    }
  }

  // interface state control
  turnOnAddNode();

  update();
}

const deleteLink = (link) => {
  const sourceNode = link.source;
  const targetNode = link.target;
  sourceNode.links.splice(sourceNode.links.indexOf(link), 1);
  targetNode.links.splice(targetNode.links.indexOf(link), 1);
  links.splice(link.index, 1);

  update();
}

const deleteLinkEvent = (e, d) => {
  e.preventDefault();
  deleteLink(d);

}

/**
 * @desc A function that is called when a mouse drag is detected from another node
 * @param e - the event object
 *        d - the datum of the node that triggered the mouseup event
 */
const addEdge = (e, d) => {
  const newLink = { source: selectedNodeIndex, target: d.index };
  links.push(newLink);
  force.force("link").links(links);

  // update nodes with newLink's index
  nodes[selectedNodeIndex].links.push(newLink);
  nodes[d.index].links.push(newLink);

  // interface state control
  turnOffAddEdge();
  turnOnStartAddEdge();

  update();
}

const startAddEdge = (e, d) => {
  selectedNodeIndex = d.index;
  //add a listener to every node but the current one so that addEdge
  //is not called when user releases mouse over selected edge
  d3.selectAll('.node_circle')
    .filter((d) => {
      return(selectedNodeIndex != d.index)
      node.edges})
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
  d3.selectAll('.node_circle')
    .on('click.startAddEdge', startAddEdge);
}
const turnOffStartAddEdge = () => {
  d3.selectAll('.node_circle')
    .on('click.startAddEdge', null);
}

const turnOnAddEdge = () => {
  d3.selectAll('.node_circle')
    .on('click.addEdge', addEdge);
}
const turnOffAddEdge = () => {
  d3.selectAll('.node_circle')
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
  //edge section
  edges = mySvg.selectAll('.link').data(links);
  // edges exit
  edges.exit().remove();

  // edges enter
  const edgesEnter = edges
    .enter()
    .append('g').attr('class', 'link');

  edgesEnter.append('line')
    .attr('class', 'link_line');

  // add all edges to global selection
  edges = edgesEnter.merge(edges);

  //edges style on interface
  edges.select('.link_line')
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; })
    .attr('stroke', 'white')
    .attr('stroke-width', '3')
    // interface listeners
    .on('auxclick', deleteLinkEvent) 
    .on('contextmenu', turnOffDefault);


  //vertices
  vertices = mySvg.selectAll('.node').data(nodes);

  //update
  const updateVertices = vertices.remove();
  // redraw nodes so that they appear above edges.
  if(updateVertices.empty() != true) {
    for (const element of updateVertices) {
      mySvg.insert(() => {
        return(element);
      });
    }
  }

//  updateVertices.select('.node_circle')
//    .attr('cx', function(d) { return d.x; })
//    .attr('cy', function(d) { return d.y; })
//    .attr('id', (d) => {return(d.id)})
//    .attr('r', nodeValues.radius)
//    .style('fill', (d) => {
//      return colors[d.id % 6];
//    })
//    // interface listeners
//    .on('click.startAddEdge', startAddEdge)
//    .on('auxclick', deleteNode) 
//    .on('contextmenu', turnOffDefault)
//    // turn of listener for add node so that new node is not created
//    .on('mouseover.addNode', turnOffAddNode)
//    .on('mouseout.addNode', turnOnAddNode)
//    .on('mouseover.addEdgeState', turnOffAddEdgeStateListener)
//    .on('mouseout.addEdgeState', turnOnAddEdgeStateListener);
//
//  updateVertices.select('.node_label')
//    .attr('x', function(d) { return d.x; })
//    .attr('y', function(d) { return d.y; })
//    .attr('text-anchor', 'middle')
//    .html((d) => { return('v' + d.id) } );

  //exit
  vertices.exit().remove();

  //enter
  const verticesEnter = vertices
    .enter()
    .append('g').attr('class', 'node');

  verticesEnter.append('circle')
    .attr('class', 'node_circle');

  verticesEnter.append('text')
    .attr('class', 'node_label');


  // add all vertices to gobal selection
  // This is important for the updating of positions
  vertices = vertices.merge(verticesEnter);

  vertices.select('.node_circle')
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; })
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

  vertices.select('.node_label')
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; })
    .attr('text-anchor', 'middle')
    .html((d) => { return('v' + d.id) } );


    


  force.nodes(nodes);
  force.force("link").links(links);
  force
    .alpha(1)
    .restart();
}


const tick = (e) => {
  d3.selectAll('.link_line')
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });
  d3.selectAll('.node_circle')
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; });
  d3.selectAll('.node_label')
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; });
}


force.on('tick', tick);


"use strict";

const myVertexSet = [];
const myEdgeSet = [];

const addVertex = (myEvent) => {
  myVertexSet.push(myVertexSet.length+1);
  console.debug("myVertexSet", myVertexSet);
  const coordinates = d3.pointer(myEvent)
  const newVertex = d3.select("g")

  newVertex.append("circle")
    .attr('cx', coordinates[0])
    .attr('cy', coordinates[1])
    .attr('r', 20)
    .attr('fill', 'white')
    .attr('stroke', 'black');
  newVertex.append("text")
    .attr('x', coordinates[0])
    .attr('y', coordinates[1])
    .attr('text-anchor', 'middle')
    .style('color', 'white')
    .html("hello");
  
  d3.select("#main").append(newVertex);
}

const mySvg = d3.select("#main")
  .on("click", addVertex);


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


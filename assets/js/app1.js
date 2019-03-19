// @TODO: YOUR CODE HERE!
// Define SVG area dimensions
var svgWidth = 900;
var svgHeight = 600;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 80,
  left: 80
};

///Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
function create_svg()
{
var svg = d3.select("#scatter")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox","0 0 700 690")
    .attr("class", "svg-content");
  // .attr("height", svgHeight)
  // .attr("width", svgWidth);

  return(svg);
}
// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
function Initalise()
{
var svg = create_svg();
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  return(chartGroup);
};


//Initial Params

var chosenxAxis="poverty";
var chosenyAxis="healthcare";

//update x scale 
function xScale(jdata,chosenxAxis){
   var xScale = d3.scaleLinear()
                 .range([0,chartWidth])
                 .domain([d3.min(jdata,d=>d[chosenxAxis])*0.75,d3.max(jdata,d=>d[chosenxAxis])*1.2]);
     return xScale;
   }

function yScale(jdata,chosenyAxis){
    var yScale = d3.scaleLinear()
                  .range([chartHeight,0])
                  .domain([d3.min(jdata,d=>d[chosenyAxis])*0.75,d3.max(jdata,d=>d[chosenyAxis])*1.2]);
      return yScale;
    }

function renderxAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

function renderyAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
 }

function renderCircles(circlesGroup, newXScale, chosenxaxis,newYScale,chosenyAxis) {

    circlesGroup.transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr("cx", d => newXScale(d[chosenxAxis]))
      .attr("cy",d=>newYScale(d[chosenyAxis]));
  
    return circlesGroup;
  }

  function updateToolTip(chosenxAxis, chosenyAxis,circlesGroup) {

    // if (chosenxAxis === "poverty") {
    //   var label = "Poverty:";
    // }
    // else {
    //   var label = "Age:";
    // }

    switch (chosenxAxis){
      case "poverty":
        var label="Poverty:";
        break;
      case "age":
        var label="Age:"
        break;
      case "income":
      var label="Income";
      break;
    }

    switch (chosenyAxis){
      case "healthcare":
        var ylabel="Health Care:";
        break;
      case "smokes":
        var ylabel="Smokes:"
        break;
      case "obesity":
      var ylabel="Obesity:";
      break;
    }

    var toolTip=d3.tip()
  .offset([80, -60])
  .attr("class","tooltip")
  .html(function(d) {
          return (`${d.state}<br>${label} ${d[chosenxAxis]}<br>${ylabel} ${d[chosenyAxis]}`);
  });


///Create tool tip in chart
// chartGroup.call(toolTip);
circlesGroup.call(toolTip);

circlesGroup.on("mouseover", function(data) {
  toolTip.show(data, this);
})
// onmouseout event
.on("mouseout", function(data) {
  toolTip.hide(data);
});

return circlesGroup;

}


function updateText(Textgroup,chosenxAxis,jdata,chartGroup,newxScale,yLinearScale,chosenyAxis)
  {
  
  
  Textgroup.text(d=>d.abbr)
  .attr("text-align","middle")
  .attr("alignment-baseline","middle")
  .attr("x",d=>newxScale(d[chosenxAxis]))
  
  .attr("y", d => yLinearScale(d[chosenyAxis]))
  .attr("font-size","8px")
  .transition()
  .duration(500)
  // .ease(d3.easeLinear)

  return(Textgroup)
}

  //load data from data.csv

function  makeResponsive(){
  // var svgArea = d3.select("body").select("svg");
  // if (!svgArea.empty()) {
  //   svgArea.remove();
  // }
  var chartGroup=Initalise();
  d3.csv("./assets/data/data.csv").then(function(jdata){
     
    console.log(jdata);
    jdata.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
  })

  var xLinearScale=xScale(jdata,chosenxAxis);

  var yLinearScale =yScale(jdata,chosenyAxis);
 
 var bottomAxis = d3.axisBottom(xLinearScale);
 var leftAxis = d3.axisLeft(yLinearScale);

 var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  var yAxis=chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.append("g").selectAll("circle")
    .data(jdata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenxAxis]))
    .attr("cy", d => yLinearScale(d[chosenyAxis]))
    .attr("r", 12)
    .attr("fill", "orange")
    .attr("opacity", ".5");

  //populate scatter text
 var Textgroup=chartGroup.append("g").selectAll("text")
  .data(jdata)
  .enter()
  .append("text")
  .text(d=>d.abbr)
  .attr("text-anchor","middle")
  .attr("alignment-baseline","middle")
  .attr("x",d=>xLinearScale(d[chosenxAxis]))
  
  .attr("y", d => yLinearScale(d[chosenyAxis]))
  .attr("font-size","7px");
  
 
// Create group for   x- axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
var povertylabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 10)
.attr("value", "poverty") // value to grab for event listener
.text("In Poverty (%)")
.attr("font-weight","bold")
.attr("text-anchor","middle");


var agelabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 30)
.attr("value", "age") // value to grab for event listener
.text("Age in Median")
.attr("text-anchor","middle");

var incomelabel = labelsGroup.append("text")
         .attr("x",0)
         .attr("y",50)
         .attr("value","income")
         .text("Household Income")
         .attr("text-anchor","middle");



// Create group for Y axis and append y axis
var labelsygroup = chartGroup.append("g")
 .attr("transform", "rotate(-90)");

 var healthlabel=labelsygroup.append("text")
  .attr("y", 0 - chartMargin.left)
 .attr("x", 0 - (chartHeight / 2))
 .attr("dy", "1em")
 .attr("value","healthcare")
 .text("Lacks Healthcare(%)")
 .attr("font-weight","bold")
 .attr("text-anchor","middle");

 var smokeslabel = labelsygroup.append("text")
 .attr("y", 0 - chartMargin.left + 20)
.attr("x", 0 - (chartHeight / 2))
.attr("dy", "1em")
.attr("value","smokes")
.text("Smokes")
.attr("text-anchor","middle");

var obesitylabel = labelsygroup.append("text")
 .attr("y", 0 - chartMargin.left + 40)
.attr("x", 0 - (chartHeight / 2))
.attr("dy", "1em")
.attr("value","obesity")
.text("Obesity")
.attr("text-anchor","middle");


  
    
 // updateToolTip function above csv import
 var circlesGroup = updateToolTip(chosenxAxis,chosenyAxis, circlesGroup);
 
 //x-Axis change Function 
 labelsGroup.selectAll("text")
 .on("click", function() {
   console.log("in xaxis event listener")
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenxAxis) {

     // replaces chosenXAxis with value
     chosenxAxis = value;

     // console.log(chosenXAxis)

     // functions here found above csv import
     // updates x scale for new data

    
     xLinearScale = xScale(jdata, chosenxAxis);

     // updates x axis with transition
     xAxis = renderxAxes(xLinearScale, xAxis);
     
     // updates circles with new x values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis,yLinearScale,chosenyAxis);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenxAxis,chosenyAxis, circlesGroup);

       // remove it and replace it with a resized version of the chart
  
     Textgroup =updateText(Textgroup,chosenxAxis,jdata,chartGroup,xLinearScale,yLinearScale,chosenyAxis);

     // changes classes to change bold text
     switch(chosenxAxis){

      case "age" : 
      {
        agelabel
        .classed("active", true)
        .classed("inactive", false);
        povertylabel
        .classed("active", false)
        .classed("inactive", true);
        incomelabel
          .classed("active",false)
          .classed("inactive",true);
      break;

      }
      case "income" :
      {
        agelabel
        .classed("active", false)
        .classed("inactive", true);
        povertylabel
        .classed("active", false)
        .classed("inactive", true);
        incomelabel
          .classed("active",true)
          .classed("inactive",false);
      break;
      }
      case "poverty" :
      {
        agelabel
        .classed("active", false)
        .classed("inactive", true);
        povertylabel
        .classed("active", true)
        .classed("inactive", false);
        incomelabel
          .classed("active",false)
          .classed("inactive",true);
       break;
      }

     }
     
     
   }
 });

// Y axis change
labelsygroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenyAxis) {

     // replaces chosenyAxis with value
     chosenyAxis = value;

  
    
     yLinearScale = yScale(jdata, chosenyAxis);

     // updates y axis with transition
     yAxis = renderyAxes(yLinearScale, yAxis);
     
     // updates circles with new x values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis,yLinearScale,chosenyAxis);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenxAxis, chosenyAxis,circlesGroup);

       // remove it and replace it with a resized version of the chart
  
     Textgroup =updateText(Textgroup,chosenxAxis,jdata,chartGroup,xLinearScale,yLinearScale,chosenyAxis);

     // changes classes to change bold text
     switch(chosenyAxis){

      case "healthcare" : 
      {
        healthlabel
        .classed("active", true)
        .classed("inactive", false);
        smokeslabel
        .classed("active", false)
        .classed("inactive", true);
        obesitylabel
          .classed("active",false)
          .classed("inactive",true);
      break;

      }
      case "smokes" :
      {
        healthlabel
        .classed("active", false)
        .classed("inactive", true);
        smokeslabel
        .classed("active", true)
        .classed("inactive", false);
        obesitylabel
          .classed("active",false)
          .classed("inactive",true);
      break;
      }
      case "obesity" :
      {
        healthlabel
        .classed("active", false)
        .classed("inactive", true);
        smokeslabel
        .classed("active", false)
        .classed("inactive", true);
        obesitylabel
          .classed("active",true)
          .classed("inactive",false);
       break;
      }

     }
     
     
   }
 });


 


})
  .catch(function(error){
      console.log(error)
  });
}

makeResponsive();

// d3.select(window).on("resize", makeResponsive);
// Set global variables (SVG dimensions, chart margins)
var svgWidth = 700;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;


function createSVGArea(){
  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
  return (
   d3.select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth))

};

function createSVG_GRP(svgObj){ 

    // Append a group area, then set its margins
    return (svgObj.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`));
}

// function used for updating x-scale var upon click on axis label
function renderXScale(inputData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(inputData, d => d[chosenXAxis]) * 0.8,
      d3.max(inputData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;

}
// function used for updating y-scale var upon click on axis label
function renderYScale(inputData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(inputData, d => d[chosenYAxis]) * 0.8,
      d3.max(inputData, d => d[chosenYAxis]) * 1.2
    ])
    .range([chartHeight, 0]);

  return yLinearScale;

}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newyScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

function renderToolTip(cirGrp, xAxisVal, yAxisVal){
  // Step 1: Initialize Tooltip
  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
    return (`<strong>${d.state}<br>${xAxisVal} : ${d[xAxisVal]}%<br>${yAxisVal} : ${d[yAxisVal]}%
    </strong`);
  });

// Step 2: Create the tooltip in chartGroup.
cirGrp.call(toolTip);

// Step 3: Create "mouseover" event listener to display tooltip
cirGrp.on("mouseover", function(d) {
  toolTip.show(d, this);
})
// Step 4: Create "mouseout" event listener to hide tooltip
  .on("mouseout", function(d) {
    toolTip.hide(d);
  });
} 

function renderPlot(xParam = "poverty", yParam = "healthcare"){

  // create svg area
  var svg = createSVGArea();
  var chartGroup = createSVG_GRP(svg);

  //Load data from csv
  d3.csv("./assets/data/data.csv").then(function(censusData){ 
    // load data from CSV and format numeric fields
    console.log(censusData);
    censusData.forEach(function(row){
        row.poverty = +row.poverty;
        row.age = +row.age;
        row.income = +row.income;
        row.healthcare = +row.healthcare;
        row.obesity = +row.obesity;
        row.smokes = +row.smokes;
        row.abbr = row.abbr;
      })

      

      // #################### Begin Plotting #################
      // Obtain scale based on x and y axis selection
      xScale = renderXScale(censusData, xParam);
      yScale = renderYScale(censusData, yParam);
      
      // Create axis objects
      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      // Append x and y axis to the plot
      chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .attr("stroke", "gray") //give gray colored text
      .call(xAxis);

      // Left YAxis append - Dow Index
      chartGroup.append("g")
      .attr("stroke", "gray") //give gray colored text
      .call(yAxis);
      
      // Scatter plot : append circles to data points
          // display scatter points
      var circlesGroup = chartGroup.append("g").selectAll("circle")
          .data(censusData)
          .enter()
          .append("circle")
          .attr("cx", (d, i) => xScale(d[xParam]))
          .attr("cy", d => yScale(d[yParam]))
          .attr("r", "15")
          .attr("class", "scatter-point");

          // display text within scatter
          chartGroup.append("g").selectAll("text")
              .data(censusData)
              .enter()
              .append("text")
              .text(d => d.abbr)
              .attr("x", (d, i) => xScale(d[xParam]))
              .attr("y", d => yScale(d[yParam]))
              .attr("text-anchor", "middle")
              .attr('alignment-baseline', 'middle')
              .attr("class","scatter-txt");
          
              // Create / Update tooltip
              renderToolTip(circlesGroup,xParam, yParam)
          
      // Create labels for x and y axis
      // text label for the x axis
      chartGroup.append("text")             
      .attr("transform",
            "translate(" + (chartWidth/2) + " ," + 
                          (chartHeight + margin.top-20) + ")")
      .style("text-anchor", "middle")
      .text("In Poverty (%)");

      // text label for the y axis
      chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Lack of HealthCare (%)");
      
      
    })
  .catch(function(error){
    console.log(error);
    console.log("in error");
  });

}

renderPlot("poverty","healthcare");

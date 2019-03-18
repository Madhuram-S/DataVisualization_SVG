// Set global variables (SVG dimensions, chart margins)
var svgWidth = 700;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 120,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Define x and y labels object
var xLblsObj = {};
var yLblsObj = {};

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
    .domain([d3.min(inputData, d => d[chosenXAxis]) * 0.95,
      d3.max(inputData, d => d[chosenXAxis]) * 1.02
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
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]))
    .attr("cy", d => newYScale(d[chosenYaxis]));

  return circlesGroup;
}

function renderCirclesTxt(txtGrp, newXScale, newYScale, chosenXaxis, chosenYaxis) {

  txtGrp.transition()
    .duration(1000)
    .attr("x", (d, i) => newXScale(d[chosenXaxis]))
    .attr("y", d => newYScale(d[chosenYaxis]));

  return txtGrp;
}
function renderToolTip(cirGrp, xAxisVal, yAxisVal){
  // generate tooltip txt based on xAxis and Y axis
  // Step 1: Initialize Tooltip
  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
          if(xAxisVal === "age")
          {
            return (`<strong>${d.state}<br>Median ${xAxisVal} : ${d[xAxisVal]}<br>${yAxisVal} : ${d[yAxisVal]}%
              </strong`);
          }
          else if(xAxisVal === "income")
          {
            return (`<strong>${d.state}<br>Median ${xAxisVal} : ${d[xAxisVal]} USD<br>${yAxisVal} : ${d[yAxisVal]}%
          </strong`);
          }
          else{
            return (`<strong>${d.state}<br>${xAxisVal} : ${d[xAxisVal]}%<br>${yAxisVal} : ${d[yAxisVal]}%
          </strong`);
          }
    
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
} ;

function renderXlabels(chartGroup){  
  // Create objects for x labels
  var xLblsGrp = chartGroup.append("g")             
  .attr("transform",
        "translate(" + (chartWidth/2) + " ," + 
                      (chartHeight + margin.top-20) + ")");
  

  xLblsObj["poverty"] = xLblsGrp.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .style("text-anchor", "middle")
    .text("In Poverty (%)");

    xLblsObj["age"] = xLblsGrp.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .style("text-anchor", "middle")
    .text("Age (Median)");

    xLblsObj["income"] = xLblsGrp.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .style("text-anchor", "middle")
    .text("Income (Median)");

    return xLblsGrp;


};

function renderYlabels(chartGroup){
  // text label object for the y axis
  var yLblsGrp = chartGroup.append("g")
  .attr("transform", "rotate(-90)")  

  yLblsObj["healthcare"] = yLblsGrp.append("text")
    .attr("y", 0 - margin.left + 50)
    .attr("x",0 - (chartHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    yLblsObj["smokes"] = yLblsGrp.append("text")
    .attr("y", 0 - margin.left + 40)
    .attr("x",0 - (chartHeight / 2))
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

    yLblsObj["obesity"] = yLblsGrp.append("text")
    .attr("y", 0 - margin.left +20)
    .attr("x",0 - (chartHeight / 2))
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obsese (%)");

    return yLblsGrp;


};

function updatePlot(inputData,xParam, yParam, xAxis, yAxis, circlesGroup, circleTxtGrp ){
    // updates x & y scale for new data
    xNewScale = renderXScale(inputData, xParam);
    yNewScale = renderYScale(inputData, yParam);
    
    // updates x & y  axis with transition
    xAxis = renderXAxes(xNewScale, xAxis);
    yAxis = renderYAxes(yNewScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xNewScale,yNewScale, xParam, yParam);
    circleTxtGrp = renderCirclesTxt(circleTxtGrp,xNewScale,yNewScale, xParam, yParam )

    // updates tooltips with new info
    renderToolTip(circlesGroup, xParam, yParam);

    // changes classes to change bold text
    Object.entries(xLblsObj).map(([key,value]) => 
                    {
                      if (key == xParam) {
                        value
                        .classed("active", true)
                        .classed("inactive", false);
                      }
                      else
                      {
                        value
                            .classed("active", false)
                            .classed("inactive", true);
                      }
                    });

    Object.entries(yLblsObj).map(([key, value]) => {
                    if (key == yParam) {
                      value
                      .classed("active", true)
                      .classed("inactive", false);
                    }
                    else
                    {
                      value
                          .classed("active", false)
                          .classed("inactive", true);
                    }
                  });
};

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
      var bottomAxis = d3.axisBottom(xScale);
      var leftAxis = d3.axisLeft(yScale);

      // Append x and y axis to the plot
      var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .attr("stroke", "gray") //give gray colored text
      .call(bottomAxis);

      // Left YAxis append - Dow Index
      var yAxis = chartGroup.append("g")
      .attr("stroke", "gray") //give gray colored text
      .call(leftAxis);
      
      // Scatter plot : append circles to data points
      // display scatter points
      var circlesGroup = chartGroup.append("g").selectAll("circle")
          .data(censusData)
          .enter()
          .append("circle")
          .attr("cx", (d, i) => xScale(d[xParam]))
          .attr("cy", d => yScale(d[yParam]))
          .attr("r", "10")
          .attr("class", "scatter-point");

          // display text within scatter
          var circleTxtGrp = chartGroup.append("g").selectAll("text")
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
          
      // Render x and y labels
      var xLblsGrp = renderXlabels(chartGroup);
      var yLblsGrp = renderYlabels(chartGroup);
      
      // Listen to on-click event labels
      // x axis labels event listener
      xLblsGrp.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== xParam) {
          // replaces xParam with value
          xParam = value;
          updatePlot(censusData, xParam, yParam, xAxis, yAxis, circlesGroup, circleTxtGrp);          
          
        }
      });

      // y axis labels event listener
      yLblsGrp.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== yParam) {

          // replaces xParam with value
          yParam = value;

          console.log(yParam)
          
          updatePlot(censusData, xParam, yParam, xAxis, yAxis, circlesGroup, circleTxtGrp);          
          
        }
      });
      
      
  })
  .catch(function(error){
    console.log(error);
    console.log("in error");
  });

}

renderPlot("poverty","healthcare");

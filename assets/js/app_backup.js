// Set global variables (SVG dimensions to calculate chart margins)
var svgWidth = 700;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 10,
  right: 30,
  bottom: 120,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Define x and y labels object
var xLblsObj = {};
var yLblsObj = {};

// function to create entire SVG area
function createSVGArea(){
  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
  // Return the newly created SVG object - 
  // Key things to note - instead of height and width preserveAspet ratio and ViewBox added for responsive svg
  return (
   d3.select("#scatter")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox","0 0 700 700")
    .attr("class", "svg-content")
  )
};
// Function to create chart group
function createSVG_GRP(svgObj){ 
    // function to create SVG Chart Object
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
};

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]))
    .attr("cy", d => newYScale(d[chosenYaxis]));

  return circlesGroup;
};
// Function to update the position of the ST code within circles
function renderCirclesTxt(txtGrp, newXScale, newYScale, chosenXaxis, chosenYaxis) {

  txtGrp.transition()
    .duration(1000)
    .attr("x", (d, i) => newXScale(d[chosenXaxis]))
    .attr("y", d => newYScale(d[chosenYaxis]));

  return txtGrp;
};
// Function to render Tooltip
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

// Function to render X labels
function renderXlabels(chartGroup){  
  // Create objects for x labels
  var xLblsGrp = chartGroup.append("g")             
  .attr("transform",
        "translate(" + (chartWidth/2) + " ," + 
                      (chartHeight + margin.top+5) + ")");
  

  xLblsObj["poverty"] = xLblsGrp.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("aText", true)
    .classed("active", true)
    .style("text-anchor", "middle")
    .text("In Poverty (%)");

    xLblsObj["age"] = xLblsGrp.append("text")
    .attr("x", 0)
    .attr("y", 35)
    .attr("value", "age") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .style("text-anchor", "middle")
    .text("Median Age (Yrs)");

    xLblsObj["income"] = xLblsGrp.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "income") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .style("text-anchor", "middle")
    .text("Median Income (USD)");

    return xLblsGrp;


};
// Function to render Y Labels
function renderYlabels(chartGroup){
  // text label object for the y axis
  var yLblsGrp = chartGroup.append("g")
  .attr("transform", "rotate(-90)")  

  yLblsObj["healthcare"] = yLblsGrp.append("text")
    .attr("y", 0 - margin.left + 60)
    .attr("x",0 - (chartHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("aText", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    yLblsObj["smokes"] = yLblsGrp.append("text")
    .attr("y", 0 - margin.left + 55)
    .attr("x",0 - (chartHeight / 2))
    .attr("value", "smokes") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokes (%)");

    yLblsObj["obesity"] = yLblsGrp.append("text")
    .attr("y", 0 - margin.left +37)
    .attr("x",0 - (chartHeight / 2))
    .attr("value", "obesity") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Obsese (%)");

    return yLblsGrp;


};

// Function to render the correct plot explanations in the div above SVG
function togglePlotExplanation(chosenXAxis){
  // Based on chosen x axis value, only make the relevant div section visible and do not display the others
  switch(chosenXAxis){
    case "age":
      d3.select(`#age`)
        .classed("p_active", true)
        .classed("p_inactive", false);
      d3.select(`#income`)
        .classed("p_active", false)
        .classed("p_inactive", true);
      d3.select(`#poverty`)
        .classed("p_active", false)
        .classed("p_inactive", true);
      break;
    case "income":
    d3.select(`#age`)
    .classed("p_active", false)
    .classed("p_inactive", true);
    d3.select(`#income`)
      .classed("p_active", true)
      .classed("p_inactive", false);
    d3.select(`#poverty`)
      .classed("p_active", false)
      .classed("p_inactive", true);
      break;
    case "poverty":
      d3.select(`#age`)
      .classed("p_active", false)
      .classed("p_inactive", true);
      d3.select(`#income`)
        .classed("p_active", false)
        .classed("p_inactive", true);
      d3.select(`#poverty`)
        .classed("p_active", true)
        .classed("p_inactive", false);
  }

};
// Function to update plot based on user input (click of xAxis or yAxis labels)
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

    // Render Plot Explanations
    togglePlotExplanation(xParam);

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

// Main function to render the plot by reading data from CSV
function renderPlot(xParam = "poverty", yParam = "healthcare"){

  // create svg area - preparation to display data
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
      .attr("class", "tickLabel")
      .call(bottomAxis);

      // Left YAxis append - (healthcare, smoker % and Obesity %)
      var yAxis = chartGroup.append("g")
      .attr("class", "tickLabel")       
      .call(leftAxis);
      
      // Scatter plot : append circles to data points      
      var circlesGroup = chartGroup.append("g").selectAll("circle")
          .data(censusData)
          .enter()
          .append("circle")
          .attr("cx", (d, i) => xScale(d[xParam]))
          .attr("cy", d => yScale(d[yParam]))
          .attr("r", "10")
          .attr("class", "scatter-point");

          // display state code within scatter
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

      // Render Plot Explanation based on the chosen X axis value
      togglePlotExplanation(xParam);
      // ################################### End of Plot #########################################
      // #################### Begin Event Listnening ###################################
      // Listen to on-click event labels
      // x axis labels event listener
      xLblsGrp.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== xParam) {
          // replaces xParam with value
          xParam = value;
          // Call updatePlot () to refresh the plot based on user input
          updatePlot(censusData, xParam, yParam, xAxis, yAxis, circlesGroup, circleTxtGrp);          
        }
      });

      // y axis labels event listener
      yLblsGrp.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== yParam) {
            // replaces yParam with value
          yParam = value;
          // Update plot using new chosen value for Y Axis
          updatePlot(censusData, xParam, yParam, xAxis, yAxis, circlesGroup, circleTxtGrp);          
        }
      });
      // #################### End Event Listnening ###################################
  })
  .catch(function(error){
    // Any error encountered will be thrown into console log
    console.log(error);
    throw error;
  });
// #################### End of d3.csv function ###################################
};

// Provide the initial x and y axis to plot
renderPlot("poverty","healthcare");

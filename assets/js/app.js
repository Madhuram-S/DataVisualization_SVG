// Set global variables (strictly only to calculate chart margins)
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
var xAxLbls = [{"lbl":"poverty", "pos":20, "lbltxt":"In Poverty (%)"},
                {"lbl":"age","pos":40,"lbltxt": "Median Age (yrs)"},
                {"lbl":"income","pos":60,"lbltxt":"Median Income (USD)"}];
var yAxLbls = [{"lbl":"healthcare", "pos":60, "lbltxt":"Lacks Healthcare(%)"},
                {"lbl":"smokes","pos":40,"lbltxt": "Smokes (%)"},
                {"lbl":"obesity","pos":20,"lbltxt":"Obesity (%)"}];              


// ###################### DEFINE HELPER FUNCTIONS ########################
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
function renderCircles(circlesGroup, xScale, yScale, chosenXaxis, chosenYaxis, mode = "create") {
    if(mode === "create"){
      // Scatter plot : append circles to data points      
      circlesGroup = circlesGroup 
          .enter()
          .append("circle")
          .attr("cx", (d, i) => xScale(d[chosenXaxis]))
          .attr("cy", d => yScale(d[chosenYaxis]))
          .attr("r", "10")
          .attr("class", "scatter-point");
    }
    else{
      // Else update circles group to new x or y values
      console.log("in update section")
      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xScale(d[chosenXaxis]))
        .attr("cy", d => yScale(d[chosenYaxis]));
    }
  return circlesGroup;
};
// Function to update the position of the ST code within circles
function renderCirclesTxt(txtGrp, xScale, yScale, chosenXaxis, chosenYaxis, mode="create") {
    if(mode === "create")
    {
      txtGrp = txtGrp
          .enter()
          .append("text")
          .text(d => d.abbr)
          .attr("x", (d, i) => xScale(d[chosenXaxis]))
          .attr("y", d => yScale(d[chosenYaxis]))
          .attr("text-anchor", "middle")
          .attr('alignment-baseline', 'middle')
          .attr("class","scatter-txt");          
    }
    else{
      txtGrp.transition()
        .duration(1000)
        .attr("x", (d, i) => xScale(d[chosenXaxis]))
        .attr("y", d => yScale(d[chosenYaxis]));
    }
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

function renderLabels(chartGroup, whichAxis = "xAxis", chosenXAxis, chosenYAxis){
  var lblsGrp;
  console.log(chosenXAxis);
  if(whichAxis === "xAxis"){
    // Create objects for x labels
      var lblsGrp = chartGroup.append("g")             
      .attr("transform",
            "translate(" + (chartWidth/2) + " ," + 
                          (chartHeight + margin.top+5) + ")");
    // populate labels
    xAxLbls.forEach(i => { 
          xLblsObj[i.lbl] = lblsGrp.append("text")
            .attr("x", 0)
            .attr("y", i.pos)
            .attr("value", i.lbl) // value to grab for event listener
            .attr("class", function(d){return(i.lbl === chosenXAxis ? " aText active":"aText inactive")})            
            .style("text-anchor", "middle")
            .text(i.lbltxt);            
    });
  }
  else{
      // text label object for the y axis
      var lblsGrp = chartGroup.append("g")
      .attr("transform", "rotate(-90)")  
  
      yAxLbls.forEach(i => {
        yLblsObj[i.lbl] = lblsGrp.append("text")
        .attr("y", 0 - margin.left + i.pos)
        .attr("x",0 - (chartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("value", i.lbl) // value to grab for event listener
        .attr("class", function(d){return(i.lbl === chosenYAxis ? "aText active":"aText inactive")})        
        .text(i.lbltxt);
      })
  }
  return lblsGrp;
}

// Add Event Listener to X and Y axis
function addEvntListenerXY(lblsGrp, chosenValue, addTo, svgObjects){
  lblsGrp.selectAll("text")
      .on("click", function() {
        // get value of selection
          var value = d3.select(this).attr("value");
          
          if(addTo === "xAxis")
          {
            value !== svgObjects.xParam ? svgObjects.xParam = value: svgObjects.xParam = svgObjects.xParam;            
          }
          else{
            value !== svgObjects.yParam ? svgObjects.yParam = value: svgObjects.yParam = svgObjects.yParam;
          }
          
          // Call updatePlot () to refresh the plot based on user input
            updatePlot(svgObjects.censusData, svgObjects.xParam, svgObjects.yParam, 
              svgObjects.xAxis, svgObjects.yAxis, 
              svgObjects.circlesGroup, svgObjects.circleTxtGrp, "update");         
        
      });
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
function updatePlot(inputData,xParam, yParam, xAxis, yAxis, circlesGroup, circleTxtGrp, mode = "update" ){
    // updates x & y scale for new data
    xNewScale = renderXScale(inputData, xParam);
    yNewScale = renderYScale(inputData, yParam);
    
    // updates x & y  axis with transition
    xAxis = renderXAxes(xNewScale, xAxis);
    yAxis = renderYAxes(yNewScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xNewScale,yNewScale, xParam, yParam, "update");
    circleTxtGrp = renderCirclesTxt(circleTxtGrp,xNewScale,yNewScale, xParam, yParam, "update");

    // updates tooltips with new info
    renderToolTip(circlesGroup, xParam, yParam);

    // Render Plot Explanations
    togglePlotExplanation(xParam);

    // changes classes to change bold text
    Object.entries(xLblsObj).map(([key,value]) => {
              return(key == xParam ? value.attr("class","aText active"):value.attr("class","aText inactive"))
                  });

    Object.entries(yLblsObj).map(([key, value]) => {
      return(key == yParam ? value.attr("class","aText active"):value.attr("class","aText inactive"))                    
                  });
};

// Main function to render the plot by reading data from CSV
function renderPlot(censusData, xParam = "poverty", yParam = "healthcare"){
  
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
    });
      // create svg area - preparation to display data
      var svg = createSVGArea();
      var chartGroup = createSVG_GRP(svg);
  
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
      var circlesGroup = chartGroup.append("g").selectAll("circle").data(censusData)
      // display state code within scatter
      var circleTxtGrp = chartGroup.append("g").selectAll("text").data(censusData)
      
      circlesGroup = renderCircles(circlesGroup, xScale, yScale, xParam, yParam, "create");                                   
      circleTxtGrp = renderCirclesTxt(circleTxtGrp, xScale, yScale, xParam, yParam, "create");
      // Create / Update tooltip
      renderToolTip(circlesGroup,xParam, yParam)
          
      // Render x and y labels     
      var xLblsGrp = renderLabels(chartGroup,"xAxis",xParam, yParam);
      var yLblsGrp = renderLabels(chartGroup,"yAxis",xParam, yParam);

      // Render Plot Explanation based on the chosen X axis value
      togglePlotExplanation(xParam);

      // Construct an array of svgObjects to pass onto the event listener
      var svgObjects = {
        "censusData" :censusData, "xParam" : xParam,  "yParam" : yParam, 
        "xAxis" : xAxis, "yAxis": yAxis, "circlesGroup": circlesGroup, 
        "circlesGroup": circlesGroup, "circleTxtGrp": circleTxtGrp
      }

      // Attach event listening to X and Y axis
      addEvntListenerXY(xLblsGrp, xParam, addTo = "xAxis", svgObjects)
      addEvntListenerXY(yLblsGrp, yParam, addTo = "yAxis", svgObjects)
      // ################################### End of Plot #########################################
    
// #################### End of d3.csv function ###################################
};
// function that initializes whole logic from reading data to displayng plot
function init(){
  // Capture the promise variable by reading the csv file
  var svgData = d3.csv("./assets/data/data.csv")

  // Render the plot once captured
  svgData.then(data => renderPlot(data, "poverty","healthcare"))        
        .catch(function(error){
            // Any error encountered will be thrown into console log
            console.log(error);
            throw error;
          });

}
// Initialize plot routine
init();
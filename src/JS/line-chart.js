// Resize responsively
var resizeId;
d3.select(window).on('resize', function(){
  resizeId = setTimeout(function(){
    d3.selectAll(".line_chart").each(function(d, i){
      var thisNode = d3.select(this),
          width = d3.select("#body").node().offsetWidth - margin.left - margin.right,
          height = parseInt(this.dataset.height) - margin.top - margin.bottom;

      drawGraph(this, dataForGraphs[i], width, height, this.dataset.accent, bisectors[i], this.dataset.x, this.dataset.y, this.dataset.scatter, this.dataset.lines, this.dataset.accent.split(","), this.dataset.ordinal);
    });
  }, 500);
});

/*
  Line Chart
*/

//Tooltip
function generateTooltipMultiline(json) {
  var responseStr = "", header = json.title;

  json.responses = json.responses.map(function(d, i){
    return {
      data: d,
      color: json.colors[i]
    };
  });

  for(var i = 0; i < json.responses.length; i++){
    responseStr += "<div class = 'bubble' style = 'background:" + json.responses[i].color + "'></div> <span>" + json.labels[i] + ": " + json.responses[i].data.toFixed(2) + "</span><br>";
  }

  if(typeof json.title == "object") {
    if(json.responses.length == 1) header = "11/" + (header.getDate()) + " " + (header.getHours() % 12 == 0 ? 12 : header.getHours() % 12) + ":00" + (header.getHours() >= 12 ? "PM" : "AM");
    else header = (header.getMonth() + 1) + "/" + header.getFullYear(); //Format date
  }

  return "<h4>" + header + "</h4>" + responseStr;
}

var margin = {top: 20, right: 40, bottom: 50, left: 60};
var graphLength = d3.selectAll(".line_chart").size(),
    dataForGraphs = new Array(graphLength),
    bisectors = new Array(graphLength);

function drawGraph(currentThis, data, width, height, accent, bisector, xLabel, yLabel, scatter, numLines, colors, ordinal){
  var thisNode = d3.select(currentThis);
  var tooltip = d3.select(currentThis.firstChild);
  var useTooltip = currentThis.dataset.usetooltip;

  //Clear all existing elements in grpah
  thisNode.select('svg').selectAll("*").remove();

  //Create the line(s)
  var x = d3.scaleLinear().range([0, width]);
  if(ordinal) x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  var lines = [];
  for(var i = 0; i < numLines; i++){
    lines.push(d3.line()
      .x(function(d){ return x(d.x); })
      .y(function(d){ return y(d.y[i]); }));
  }

  //Set Domains
  if(ordinal) {
    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain([currentThis.dataset.hours ? -0.6 : -0.4, currentThis.dataset.hours ? 0.6 : 0.8]);
  }
  else {
    x.domain([-1.2, 1.2]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.y); })]);
    x.invert = d3.scaleQuantize().domain(x.range()).range(x.domain());
  }

  var svg = thisNode.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("mousemove", function(){
      if(useTooltip){
        var positionLine = thisNode.select(".position-line");
        var x0 = x.invert(d3.mouse(this)[0] - margin.left),
          d = data[bisector(data, x0)];

        if(d != null) {
          tooltip.style("top", height - 90 + margin.top + "px")
          .classed("hidden", false)
          .html(generateTooltipMultiline({title: d.x, responses: d.y, colors: colors, labels: currentThis.dataset.labels.split(",")}))
          .style("left", (tooltip.node().offsetWidth + d3.mouse(this)[0] + 30 > d3.select("#body").node().offsetWidth ? x(d.x) + margin.left - 10 - tooltip.node().offsetWidth : x(d.x) + margin.left + 10) + "px");

          positionLine.attr("x1", x(d.x) + margin.left)
            .attr("x2", x(d.x) + margin.left)
            .classed("hidden", false);

          for(var i = 0; i < numLines; i++){
            d3.select(currentThis).select(".dot-" + i).attr("cx", x(d.x))
              .attr("cy", y(d.y[i]))
              .classed("hidden", false);
          }
        }
        else {
          tooltip.classed("hidden", true);
          positionLine.classed("hidden", true);
          svg.selectAll(".dot").classed("hidden", true);
        }
      }
    })
    .on("mouseout", function(d){
      var positionLine = thisNode.select(".position-line");
      tooltip.classed("hidden", true);
      positionLine.classed("hidden", true);
      svg.selectAll(".dot").classed("hidden", true);
    })
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Tooltip line
  thisNode.select('svg').append("line")
    .attr("class", "position-line hidden")
    .attr("x1", x(0))
    .attr("y1", y(ordinal ? currentThis.dataset.hours ? -0.6 : -0.4 : 0) + margin.top)
    .attr("x2", x(0))
    .attr("y2", y(ordinal ? currentThis.dataset.hours ? 0.6 : 0.8 : 1) + margin.top)
    .style("stroke", "black")
    .style("stroke-width", "1")
    .style("stroke-dasharray", "5,5");

  //Add horizontal line if ordinal
  if(ordinal){
    svg.append("line")
      .attr("class", "mean-line")
      .attr("x1", x(data[0].x))
      .attr("x2", x(data[data.length - 1].x))
      .attr("y1", y(0) + 1)
      .attr("y2", y(0) + 1)
      .style("stroke", "#ccc")
      .style("stroke-dasharray", "1");
  }

  for(var i = 0; i < numLines; i++){
    // Add the line path.
    svg.append("path")
      .data([data])
      .attr("class", "line")
      .style("stroke", colors[i])
      .style("stroke-width", "2px")
      .style("fill", "none")
      .attr("d", lines[i]);

    // Add tooltip dots
    svg.append("circle")
      .attr("class", "dot-" + i + " dot hidden")
      .style("fill", colors[i])
      .attr("r", 5);
  }

  //Add the X Axis
  if(ordinal){
    svg.append("g")
      .style("font-family", "IBM_Plex_Sans")
      .style("font-size", "14px")
      .attr("transform", "translate(0," + (height) + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat(currentThis.dataset.hours ? "11/%d %I:00%p" : "%m/%Y")).ticks(4))
      .selectAll("text")
        .attr("y", 15)
        .attr("x", 15)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-15)")
        .style("text-anchor", "end");
  }
  else{
    svg.append("g")
      .style("font-family", "IBM_Plex_Sans")
      .style("font-size", "14px")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(4));
  }

  //Add the Y Axis
  svg.append("g")
    .style("font-family", "IBM_Plex_Sans")
    .style("font-size", "14px")
    .call(d3.axisLeft(y).ticks(5));

  //Label for Y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "IBM_Plex_Sans")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(yLabel);

  //Label for X axis
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + (ordinal ? 40 : 20)) + ")")
    .style("text-anchor", "middle")
    .style("font-family", "IBM_Plex_Sans")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(xLabel);
}

d3.selectAll(".line_chart").each(function(d, index){
  var accent = this.dataset.accent,
      colors = accent.split(","),
      thisNode = d3.select(this),
      currentElement = this,
      csv = this.dataset.csv,
      xLabel = this.dataset.x,
      yLabel = this.dataset.y,
      numLines = this.dataset.lines,
      currentThis = this;

  var data = [];

  $.ajax({
    url: csv,
    success: function (csvd) {
      csvd.split("\n").map(function(d){
        var temp = d.split(",");
        if(temp[0]){
          var parseTime = d3.timeParse("%m/%Y");
          if(currentThis.dataset.hours) parseTime = d3.timeParse("%d %H");
          data.push({
            x: currentThis.dataset.ordinal ? parseTime(temp[0]) : parseFloat(temp[0]),
            y: temp.slice(1).map(function(element){
              return parseFloat(element);
            })
          });
        }
      });

      var bisector = d3.bisector(function(d) { return d.x; }).right;

      dataForGraphs[index] = data;
      bisectors[index] = bisector;

      var width = d3.select("#body").node().offsetWidth - margin.left - margin.right,
          height = parseInt(currentElement.dataset.height) - margin.top - margin.bottom;

      thisNode.append("svg");

      drawGraph(currentThis, data, width, height, accent, bisector, xLabel, yLabel, currentElement.dataset.scatter, numLines, colors, currentElement.dataset.ordinal);

      if(numLines > 1){
        var labels = currentElement.dataset.labels.split(",");
        d3.select(currentElement).append("div")
          .attr("class", "line-label")
          .attr("width", "100%")
          .style("font-size", "14px")
          .selectAll("p").data(colors)
          .enter().append("p")
            .html(function(d, i){
              return "<div class = 'bubble' style = 'background:" + d + "'></div> " + labels[i];
            });
      }
    },
    dataType: "text"
  });
});

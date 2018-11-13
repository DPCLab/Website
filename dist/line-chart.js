// Resize responsively
var resizeId;
d3.select(window).on('resize', function(){
  resizeId = setTimeout(function(){
    d3.selectAll(".line_chart").each(function(d, i){
      var thisNode = d3.select(this),
          width = d3.select("#body").node().offsetWidth - margin.left - margin.right,
          height = parseInt(this.dataset.height) - margin.top - margin.bottom;

      drawGraph(this, dataForGraphs[i], width, height, this.dataset.accent, d3.select(this.firstChild), bisectors[i], this.dataset.x, this.dataset.y, this.dataset.scatter, this.dataset.lines, this.dataset.accent.split(","), this.dataset.ordinal);
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

  if(typeof json.title == "object") header = (header.getMonth() + 1) + "/" + header.getFullYear(); //Format date

  return "<h4>" + header + "</h4>" + responseStr;
}

var margin = {top: 20, right: 40, bottom: 50, left: 60};
var graphLength = d3.selectAll(".line_chart").size(),
    dataForGraphs = new Array(graphLength),
    bisectors = new Array(graphLength);

function drawGraph(currentThis, data, width, height, accent, tooltip, bisector, xLabel, yLabel, scatter, numLines, colors, ordinal){
  var thisNode = d3.select(currentThis);

  //Clear all existing elements in grpah
  thisNode.select('svg').selectAll("*").remove();

  //Create the line(s)
  var x = d3.scalePoint().rangeRound([0, width]).padding(0.1);
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
    y.domain([-1, 1]);
  }
  else {
    x.domain(data.map(function(d) { return "" + d.x; }));
    y.domain([0, d3.max(data, function(d) { return d3.max(d.y); })]);
    x.invert = d3.scaleQuantize().domain(x.range()).range(x.domain());
  }

  var svg = thisNode.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("mouseover", function(){
      var x0 = x.invert(d3.mouse(this)[0] - margin.left),
        d = data[bisector(data, x0)];

      if(d != null) tooltip.style("left", x(d.x) + margin.left - Math.round(tooltip.node().offsetWidth / 2) + "px")
        .style("top", y(d3.max(d.y)) - Math.round(tooltip.node().offsetHeight) - 12 + margin.top + "px")
        .classed("hidden", false)
        .html(generateTooltipMultiline({title: d.x, responses: d.y, colors: colors, labels: currentThis.dataset.labels.split(",")}));
      else tooltip.classed("hidden", true).html("");

    })
    .on("mouseout", function(d){
      console.log("yo");
      tooltip.classed("hidden", true);
    })
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  }

  //Add the X Axis
  if(ordinal){
    svg.append("g")
      .style("font-family", "IBM_Plex_Sans")
      .style("font-size", "14px")
      .attr("transform", "translate(0," + (height) + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%Y")));
  }
  else{
    svg.append("g")
      .style("font-family", "IBM_Plex_Sans")
      .style("font-size", "14px")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(d3.scalePoint().domain([-1, 0, 1]).rangeRound([0, width])));
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
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
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
      tooltip = d3.select(this.firstChild),
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
          data.push({
            x: currentThis.dataset.ordinal ? parseTime(temp[0]) : temp[0],
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

      drawGraph(currentThis, data, width, height, accent, tooltip, bisector, xLabel, yLabel, currentElement.dataset.scatter, numLines, colors, currentElement.dataset.ordinal);

      if(numLines > 1){
        var labels = currentElement.dataset.labels.split(",");
        d3.select(currentElement).append("div")
          .attr("class", "line-label")
          .attr("width", "100%")
          .style("font-size", "14px")
          .selectAll("p").data(colors)
          .enter().append("p")
            .html(function(d, i){
              return "<div class = 'bubble' style = 'background:" + d + "'></div> " + labels[i] + "<br>";
            });
      }
    },
    dataType: "text"
  });
});

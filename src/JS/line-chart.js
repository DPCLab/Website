// Resize responsively
var resizeId;
d3.select(window).on('resize', function(){
  resizeId = setTimeout(function(){
    d3.selectAll(".line_chart").each(function(d, i){
      var thisNode = d3.select(this),
          width = d3.select("#body").node().offsetWidth - margin.left - margin.right,
          height = parseInt(this.dataset.height) - margin.top - margin.bottom;

      drawGraph(this, dataForGraphs[i], totalForGraphs[i], width, height, this.dataset.accent, d3.select(this.firstChild), bisectors[i], this.dataset.x, this.dataset.y, this.dataset.scatter, numLinesGraphs[i], colorsForGraphs[i], this.dataset.shade);
    });
  }, 500);
});

/*
  Line Chart
*/
var margin = {top: 20, right: 20, bottom: 50, left: 50};
var graphLength = d3.selectAll(".line_chart").size(),
    dataForGraphs = new Array(graphLength),
    totalForGraphs = new Array(graphLength),
    bisectors = new Array(graphLength),
    colorsForGraphs = new Array(graphLength),
    numLinesGraphs = new Array(graphLength);

function drawGraph(currentThis, data, total, width, height, accent, tooltip, bisector, xLabel, yLabel, scatter, numLines, colors, shade){
  var x = d3.scalePoint().rangeRound([0, width]).padding(0.1);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  var tooltipText;

  thisNode = d3.select(currentThis);

  //Create the line
  var lines = [],
      line;

  for(var i = 0; i < numLines; i++){
    line = d3.line()
      .x(function(d){ return x(d.x); })
      .y(function(d){ return y(d.y[i]); });

    lines.push(line);
  }

  thisNode.select('svg').selectAll("*").remove();

  x.domain(data.map(function(d) { return "" + d.x; }));
  y.domain([0, d3.max(data, function(d) { return d3.max(d.y); })]);
  x.invert = d3.scaleQuantize().domain(x.range()).range(x.domain());

  var svg = thisNode.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("mousemove", function(){
      var x0 = x.invert(d3.mouse(this)[0]),
          d;

      for(var i = 0; i < data.length; i++) {
        if(data[i].x == x0) {
          d = data[i - 1];
          break;
        }
      }

      if(numLines > 1) tooltipText = generateTooltipMultiline({title: d.x, responses: d.y, colors: colors, total: total, labels: currentThis.dataset.labels.split(",")});
      else tooltipText = generateTooltip({title: d.x, responses: d.y, percentage: d.y / total});
      tooltip.classed("hidden", false).html(tooltipText);

      tooltip.style("left", x(d.x) + margin.left - Math.round(tooltip.node().offsetWidth / 2) + "px")
        .style("top", y(d3.max(d.y)) - Math.round(tooltip.node().offsetHeight) - 12 + margin.top + "px");

    })
    .on("mouseout", function(d){
      var e = d3.event.toElement;
      if(e && e.parentNode.parentNode != this.parentNode && e.parentNode != this.parentNode && e != this.parentNode) tooltip.classed("hidden", true);
    })
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

  // for(var i = 0; i < numLines; i++){
  //   svg.selectAll(".dot-" + i)
  //     .data(data)
  //     .enter().append("circle")
  //     .attr("class", "dot-" + i)
  //     .style("fill", colors[i])
  //     .attr("cx", function(d){return x(d.x);})
  //     .attr("cy", function(d){return y(d.y[i]);})
  //     .attr("r", 5);
  // }

  //Add the X Axis
  svg.append("g")
    .style("font-family", "IBM_Plex_Sans")
    .style("font-size", "14px")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(d3.scalePoint().domain([-1, 0, 1]).rangeRound([0, width])));

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

  var data = [],
      total = 0;

  $.ajax({
    url: csv,
    success: function (csvd) {
      //data = $.csv.toArrays(csvd);
      csvd.split("\n").map(function(d){
        var temp = d.split(",");
        if(temp[0]){
          total += parseFloat(temp[1]);
          data.push({
            x: temp[0],
            y: temp.slice(1).map(function(element){
              return parseFloat(element)
            })
          });
        }
      });

      var bisector = d3.bisector(function(d) { return d.x; }).right;

      dataForGraphs[index] = data;
      totalForGraphs[index] = total;
      bisectors[index] = bisector;
      numLinesGraphs[index] = numLines;
      colorsForGraphs[index] = colors;

      var width = d3.select("#body").node().offsetWidth - margin.left - margin.right,
          height = parseInt(currentElement.dataset.height) - margin.top - margin.bottom;

      thisNode.append("svg");

      drawGraph(currentThis, data, total, width, height, accent, tooltip, bisector, xLabel, yLabel, currentElement.dataset.scatter, numLines, colors, currentElement.dataset.shade);

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

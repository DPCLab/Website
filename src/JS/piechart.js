/*
  Pie Chart
*/

function formatPercent(dec){
  return "" + (dec * 100).toFixed(2) + "%";
}

function drawPie(responses, id, name){
  var labels = ["Visible", "Potentially Censored"],
      colors = ["#6c5ce7", "#ffffff"],
      radius = 80,
      width = radius * 2,
      height = width;

  var total = 0;
  var piedata = responses.map(function(d, i){
    total += parseInt(d);
    return {
      label: labels[i],
      value: parseInt(d),
      color: colors[i]
    };
  });

  var pie = d3.pie()
    .value(function(d){
      return d.value;
    }).sort(null);

  var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(40);

  var tooltip = d3.select("#" + id).select(".tooltip"),
      tooltipText,
      mouse;

  d3.select("#" + id).style("width", width);

  //Add pieChart
  var myChart = d3.select("#" + id).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + (width - radius) + "," + (height - radius) + ")")
      .selectAll("path").data(pie(piedata))
      .enter().append("path")
        .attr("fill", function(d, i){
          return d.data.color;
        })
        .attr("stroke", "white")
        .attr("d", arc)
        .on("mouseover", function(d, i){
          tooltipText = "<h3>" + d.data.label + "</h3><p>" + d.value + " posts (" + formatPercent(d.value / total) + ")</p>";
          tooltip.classed("hidden", false).html(tooltipText);
        })
        .on("mousemove", function(d){
          mouse = d3.mouse(d3.select("#" + id).node());

          tooltip.style("left", mouse[0] - Math.round(tooltip.node().offsetWidth / 2) + "px")
            .style("top", mouse[1] - Math.round(tooltip.node().offsetHeight) - 12 + "px");

          d3.select("#" + id).style("fill", d3.rgb(d3.color(d.data.color).brighter(0.5)));
        })
        .on("mouseout", function(d){
          tooltip.classed("hidden", true);
          d3.select("#" + id).style("fill", d.color);
        });

  //Add labels underneath pie chart
  var pieLabel = d3.select("#" + id).append("div")
    .attr("class", "pie-label")
    .style("width", width + "px");

  if(name) pieLabel.append("h3").html(name);

  pieLabel.selectAll("span").data(piedata)
    .enter().append("span")
      .html(function(d, i){
        return "<div class = 'bubble' style = 'background:" + d.color + "'></div>" + d.label;
      }).append("br");
}

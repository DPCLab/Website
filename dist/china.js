function getTimeDelta(timeStr){ //Gets time between now and a given time in minutes and hours (a str)
  then = new Date(timeStr);
  now = new Date();
  minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  return (minutes < 60 ? minutes + " minutes": Math.round(minutes / 60) + " HOURS") + " AGO";
}

// function cleanUpTrendString(trendStr){ //
//
// }

var currentI = 0;
var rangeI;
function displayPosts(posts, lastSeen){
  var array_of_post_arrays = [];
  var SPLIT_LENGTH = 10;
  rangeI = posts.length / SPLIT_LENGTH;
  for(var i = 0; i < rangeI; i++){
    d3.select("#posts")
      .append("div")
      .attr("id", "container-" + i)
      .style("display", i == 0 ? "block" : "none")
      .selectAll("li")
      .data(posts.slice(i * SPLIT_LENGTH, Math.min(i * SPLIT_LENGTH + SPLIT_LENGTH, posts.length)))
      .enter()
      .append("li")
      .html(function(d){
        return "<img class = 'profile-photo' src = '../../assets/graphics/profile-photo.png'><h3>" + ("" + d.uid).substring(0, 5) + "*****</h3><a title = 'Translate Post' target = '_blank' href = 'https://translate.google.com/#zh-CN/en/" + d.text + "' class = 'translate is-pulled-right'><i class = 'fas fa-language'></i></a><br><p class = 'text'>" + (d.text == null ? "[This post contained an image]" : d.text) + "</p><br><div class = 'level'><div class = 'level-left'><span>LAST SEEN:</span>&nbsp;" + getTimeDelta(d.retrieved) + " (" + d.retrieved + ")" + "</div><div class = 'level-right'><a class = 'ext-link' href = '" + d.link + "' target = '_blank'><i class = 'fas fa-external-link-alt'></i></a></div></div>";
      });
  }
}

function displayTrends(trends){
  d3.select("#trends").selectAll("li")
    .data(trends)
    .enter()
    .append("li")
    .html(function(d){
      return  d.term + "<span>(" + d.meaning + ")</span>";
    });
}

function convertToCommas(num){
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

var postsUpdated = false;
function updatePosts(){
  //Add the loading icon
  $("#loading").show();

  $.get("https://cs.dpccdn.net/v1/censored_posts", function(data){
    //Display Posts
    d3.select("#posts").selectAll("*").remove(); //Get rid of existing children
    displayPosts(data.posts, data.lastUpdated);

    //Update trends
    displayTrends(data.trends.slice(0, 10)); //Show the first ten trends only

    //Update graphs
    $("#urls-monitored").html(convertToCommas(data.sourceUrls.length));
    $("#total-posts-collected").html(convertToCommas(data.stats.total.total));
    $("#potentially-censored").html(convertToCommas(data.stats.total.censored));
    drawPie([data.stats.mostRecent.visible, data.stats.mostRecent.censored], "recent-pie", "Recent Posts");
    drawPie([data.stats.total.visible, data.stats.total.censored], "all-pie", "All Collected Posts");

    //Remove the loading icon
    $("#loading").hide();

    //Show all divs
    $("#sidebar").css("display", "block");
    $("#post-column").css("display", "block");
    $("#at-a-glance").css("display", "block");
    //$("#graphs").css("display", "flex");

    postsUpdated = true;
  });
}

//Initialize
$(document).ready(function(){
  updatePosts();
});

//Autoscrolling behavior
var loading = false;
$(window).scroll(function() {
  if (postsUpdated && !loading && ($(window).scrollTop() >= $(document).height() - $(window).height() - 100)) {
    loading = true;
    if(currentI < rangeI) $("#container-" + (++currentI)).css("display", "block");
    else $("#end-message").show();
    loading = false;
  }
});

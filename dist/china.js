function getTimeDelta(timeStr){ //Gets time between now and a given time in minutes and hours (a str)
  then = new Date(timeStr);
  now = new Date();
  minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  return (minutes < 60 ? minutes + " minutes": Math.round(minutes / 60) + " hours") + " ago";
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
        return "<img class = 'profile-photo' src = '../../assets/graphics/profile-photo.png'><h2>" + ("" + d.uid).substring(0, 5) + "*****</h2><br><p class = 'text'>" + d.text + "</p><br><div class = 'level'><div class = 'level-left'><span>LAST SEEN:</span>&nbsp;" + getTimeDelta(d.retrieved) + " (" + d.retrieved + ")" + "</div><div clas = 'level-right'><a class = 'ext-link' href = '" + d.link + "' target = '_blank'>SEE ORIGINAL&nbsp;&nbsp;<i class = 'fas fa-external-link-alt'></i></a></div></div>";
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

var postsUpdated = false;
function updatePosts(){
  //Add the loading icon
  $("#loading").show();

  $.get("https://cs.dpccdn.net/v1/censored_posts", function(data){
    //Display Posts
    d3.select("#posts").selectAll("*").remove(); //Get rid of existing children
    displayPosts(data.posts, data.lastUpdated);

    console.log(data);

    //Update trends
    displayTrends(data.trends.slice(0, 10)); //Show the first ten trends only

    //Remove the loading icon
    $("#loading").hide();

    //Show both divs
    $("#sidebar").css("display", "block");
    $("#post-column").css("display", "block");

    postsUpdated = true;
  });
}

$(document).ready(function(){
  updatePosts();
});

//Autoscrolling behavior
var loading = false;
$(window).scroll(function() {
  if (postsUpdated && !loading && ($(window).scrollTop() >= $(document).height() - $(window).height())) {
    loading = true;
    if(currentI < rangeI) $("#container-" + (++currentI)).css("display", "block");
    else $("#end-message").show();
    loading = false;
  }
});

function getTimeDelta(timeStr){ //Gets time between now and a given time in minutes and hours (a str)
  then = new Date(timeStr);
  now = new Date();
  minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  return (minutes < 60 ? minutes + " minutes": Math.round(minutes / 60) + " hours") + " ago";
}

// function cleanUpTrendString(trendStr){ //
//
// }

function displayPosts(posts, lastSeen){
  d3.select("#posts").selectAll("li")
    .data(posts)
    .enter()
    .append("li")
    .html(function(d){
      return "<img class = 'profile-photo' src = '../../assets/graphics/profile-photo.png'><h2>" + ("" + d.uid).substring(0, 5) + "*****</h2><br><p class = 'text'>" + d.text + "</p><br><span>LAST SEEN:</span> " + getTimeDelta(d.retrieved) + " (" + d.retrieved + ")" + "<br>";
    });
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

function updatePosts(){
  //Add the loading icon
  $("#loading").show();

  $.get("https://cs.dpccdn.net/v1/censored_posts", function(data){
    //Display Posts
    d3.select("#posts").selectAll("*").remove(); //Get rid of existing children
    displayPosts(data.posts, data.lastUpdated);

    //Update trends
    displayTrends(data.trends.slice(0, 10)); //Show the first ten trends only

    //Remove the loading icon
    $("#loading").hide();

    //Show both divs
    $("#sidebar").css("display", "block");
    $("#post-column").css("display", "block");
  });
}

$(document).ready(function(){
  updatePosts();
});

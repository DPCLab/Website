function displayPosts(posts, lastSeen){
  d3.select("#posts").selectAll("li")
    .data(posts)
    .enter()
    .append("li")
    .html(function(d){
      return "<img class = 'profile-photo' src = '../assets/graphics/profile-photo.png'><h2>" + ("" + d.uid).substring(0, 5) + "*****</h2><br><p class = 'text'>" + d.text + "</p><br><span>RECEIVED:</span> " + d.retrieved + "<br><span>LAST SEEN:</span> " + lastSeen + "<br>";
    });
}

function updatePosts(){
  //Add the loading icon
  $("#loading").show();

  $.get("https://cs.dpccdn.net/v1/censored_posts", function(data){
    console.log(data);
    //Display Posts
    d3.select("#posts").selectAll("*").remove(); //Get rid of existing children
    displayPosts(data.posts, data.lastUpdated);

    //Remove the loading icon
    $("#loading").hide();
  });
}

$(document).ready(function(){
  updatePosts();
});

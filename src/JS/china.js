var posts = [{
  "uid": "2571906604",
  "text": "你好，你怎么样?",
  "retrieved": "2018-09-29 (11:06:01.560) EDT",
  "last_seen": "2018-09-29 (11:06:01.560) EDT"
}, {
  "uid": "2571906604",
  "text": "你好，你怎么样?",
  "retrieved": "2018-09-29 (11:06:01.560) EDT",
  "last_seen": "2018-09-29 (11:06:01.560) EDT"
}];

d3.select("#posts").selectAll("li")
  .data(posts)
  .enter()
  .append("li")
  .html(function(d){
    return "<img class = 'profile-photo' src = '../assets/graphics/profile-photo.png'><h2>" + d.uid.substring(0, 5) + "*****</h2><br><p class = 'text'>" + d.text + "</p><br><span>RECEIVED:</span> " + d.retrieved + "<br><span>LAST SEEN:</span> " + d.last_seen + "<br>";
  });

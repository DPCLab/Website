/*
  User input
  Automatically run the analyzer when the user stops typing
*/

$(document).ready(function(){
  $("#loading").hide();
});

var MAX_CHARACTERS = 240;
var typingTimer;
var $input = $('.troll-detector .text');

function isEnteredKey(keyCode){ //Checks whether the keycode will produce a longer text (i.e. "a" will return false but "SHIFT" will not)
  return keyCode == 9 || keyCode == 13 || keyCode == 32 || (keyCode >= 48 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 111) || (keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222);
}

function check_characters(e){
  $(".character-limit").html($input.text().length + "/240");
  if(isEnteredKey(e.which) && $input.text().length >= MAX_CHARACTERS) e.preventDefault();
}

$input.on('keyup', function (e){ //If the user stops typing, start a countdown
  check_characters(e);
  if(isEnteredKey(e.which)) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
      analyzeTweet();
    }, 300);
  }
});

$input.on('keydown', function (e){ //If they go back to typing, end the countdown
  //Remove the spans from displaying color once typing, if the key pressed will actually result in entered text
  check_characters(e);
  if(isEnteredKey(e.which)) {
    $input.children("span").css("background-color", "#ffffff");
    clearTimeout(typingTimer);
  }
});

/*
  Analyze Tweets
*/
var colorSwatch = ["#3A539B","#647AB3","#8FA2CC","#B9C9E5","#E4F1FE","#F1A9A0","#F08B85","#F06E6A","#F0514F","#F03434"];

//Donut chart
function drawPie(responses){
  var data = [{
    "value": 1.0 - Math.abs(responses),
    "color": "#e8e8e8"
  }, {
    "value": Math.abs(responses),
    "color": colorSwatch[Math.floor((responses + 1)*5)]
  }];

  var radius = 10,
      width = radius * 2,
      height = width;

  var pie = d3.pie()
    .value(function(d){
      return d.value;
    }).sort(null);

  var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius / 1.5);

  d3.select("#troll-pie").selectAll("*").remove();
  d3.select("#troll-pie").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + (width - radius) + "," + (height - radius) + ")")
      .selectAll("path").data(pie(data))
      .enter().append("path")
        .attr("fill", function(d, i){
          return d.data.color;
        })
        .attr("stroke", "white")
        .attr("d", arc);
}

//Returns html with highlights in the text
function addHighlighting(tweet_text, tokenized){
  highlighted_text = tweet_text;

  var keys = Object.keys(tokenized);
  for(var i = 0; i < keys.length; i++){
    if(Math.abs(tokenized[keys[i]]) > 0.3){ //Only add highlighting to significant words
      var regex = "("+keys[i]+")([^<]|$)";
      highlighted_text = highlighted_text.replace(new RegExp(regex), "<span data-proba = '" + tokenized[keys[i]] + "' class = 'hover' style = 'background-color:" + colorSwatch[Math.floor((tokenized[keys[i]] + 1)*5)] + "50'>$1</span>$2");
    }
  }

  return highlighted_text;
}

$(document).on('mouseover', '.hover', function(e){
  //Show
  var probability = "" + (parseFloat($(this).data("proba")) * 100).toFixed(2) + "%";
  if($(this).has(".hover-box").length == 0) $(this).append("<div class = 'hover-box'><strong>" + (parseFloat($(this).data("proba")) > 0 ? "Leans Troll" : "Leans Non-Troll") + "</strong> (" + probability + ")</div>");
});
$(document).on('mouseleave', '.hover', function(e){
  //Hide
  $(this).children(".hover-box").remove();
});

//Analyze Tweets
function analyzeTweet(localThis){
  //Clear hoverboxes
  $(".hover-box").remove();

  tweet_text = $input.text();
  if(tweet_text.length > 0){
    $("#loading").fadeIn();
    $.get("https://ru.dpccdn.net/analyze/" + encodeURIComponent(tweet_text.replace(/\//g, "")), function(data){
      //Add small donut chart
      drawPie(data.master);

      //Change label at the top
      if(data.master > 0) $(".is-troll").html("Leans Troll");
      else $(".is-troll").html("Leans Non-Troll");

      //Add highlighting
      $(".text").html(addHighlighting(tweet_text, data.tokenized));

      el = document.getElementById("text");
      el.focus();
      if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }

      //Hide loading icon and display pie chart
      $("#troll-pie").removeClass("hidden");
      $("#loading").fadeOut();
    });
  }
  else{
    $(".is-troll").html("Please enter your text below");
    $("#troll-pie").addClass("hidden");
    $("#loading").fadeOut();
  }
}

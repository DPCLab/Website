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

  if($input.text().length == 0){
    $(".is-troll").html("Please enter your text below");
    $("#troll-pie").addClass("hidden");
    $("#loading").fadeOut();
  }
}

// $input.on('keyup', function (e){ //If the user stops typing, start a countdown
//   check_characters(e);
//   if(isEnteredKey(e.which)) {
//     clearTimeout(typingTimer);
//     typingTimer = setTimeout(function(){
//       analyzeTweet(e);
//     }, 1000);
//   }
// });

function onKeyDown(e){
  //Remove the spans from displaying color once typing, if the key pressed will actually result in entered text
  check_characters(e);
  if(isEnteredKey(e.which)) {
    clearTimeout(typingTimer);
    $("#loading").fadeIn();
    $input.children("span").css("background-color", "#ffffff"); //Remove background highlighting

    typingTimer = setTimeout(function(){
      analyzeTweet(e);
    }, 1000);
  }
}

$input.on('keydown', onKeyDown);

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

  $("#troll-pie").removeClass("hidden");
}

//Returns html with highlights in the text
function addHighlighting(tweet_text, tokenized){
  var tokens = tweet_text.split(/([^A-Z0-9])/gi);
  var keys = Object.keys(tokenized);

  var output = "";

  for(var i = 0; i < tokens.length; i++){
    if(keys.indexOf(tokens[i]) != -1){
      output += "<span data-proba = '" + tokenized[tokens[i]] + "' class = 'hover' style = 'background-color:" + (Math.abs(tokenized[tokens[i]]) < 0.2 ? "#ffffff" : colorSwatch[Math.floor((tokenized[tokens[i]] + 1)*5)]) + "50'>" + tokens[i] + "</span>";
    }
    else{
      output += tokens[i];
    }
  }

  // for(var i = 0; i < keys.length; i++){
  //   if(Math.abs(tokenized[keys[i]]) > 0){ //Only add highlighting to significant words
  //     var regex = "([^>]|^)("+keys[i]+")([^<]|$)";
  //     highlighted_text = highlighted_text.replace(new RegExp(regex), "$1<span data-proba = '" + tokenized[keys[i]] + "' class = 'hover' style = 'background-color:" + colorSwatch[Math.floor((tokenized[keys[i]] + 1)*5)] + "50'>$2</span>$3");
  //   }
  // }

  return output;
}

function getTokenDescriptor(proba){
  if(proba > 0) return "More troll-like than organic";
  else if(proba < 0) return "More organic than troll-like";
  else return "No effect";
}

$(document).on('mouseover', '.hover', function(e){
  //Show
  var probability = "" + (parseFloat($(this).data("proba")) * 100).toFixed(2) + "%";
  if($(this).has(".hover-box").length == 0) $(this).append("<div class = 'hover-box'><strong>" + getTokenDescriptor(parseFloat($(this).data("proba"))) + "</strong> (" + probability + ")</div>");
});
$(document).on('mouseleave', '.hover', function(e){
  //Hide
  $(this).children(".hover-box").remove();
});

//Analyze Tweets
function analyzeTweet(e){
  //Clear hoverboxes
  $(".hover-box").remove();
  $("#troll-pie").addClass("hidden");

  tweet_text = $input.text();
  if(tweet_text.length > 0){
    $.get("https://ru.dpccdn.net/analyze/" + encodeURIComponent(tweet_text.replace(/\//g, "")), function(data){
      //Add small donut chart
      if(data.master != 0) drawPie(data.master);

      //Change label at the top
      if(data.master > 0) $(".is-troll").html("More troll-like than organic");
      else if(data.master == 0) $(".is-troll").html("Not enough information");
      else $(".is-troll").html("More organic than troll-like");

      //Add highlighting
      if($input.text() == tweet_text) $(".text").html(addHighlighting(tweet_text, data.tokenized));
      else onKeyDown(e);//Restart interval if text has changed

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

      //Hide loading icon
      $("#loading").fadeOut();
    });
  }
}

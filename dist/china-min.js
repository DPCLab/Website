function getTimeDelta(t){return then=new Date(t),now=new Date,minutes=Math.round((now.getTime()-then.getTime())/6e4),(minutes<60?minutes+" minutes":Math.round(minutes/60)+" HOURS")+" AGO"}var rangeI,currentI=0;function displayPosts(t,e){rangeI=t.length/10;for(var s=0;s<rangeI;s++)d3.select("#posts").append("div").attr("id","container-"+s).style("display",0==s?"block":"none").selectAll("li").data(t.slice(10*s,Math.min(10*s+10,t.length))).enter().append("li").html(function(t){return"<img class = 'profile-photo' src = '../../assets/graphics/profile-photo.png'><h3>"+(""+t.uid).substring(0,5)+"*****</h3><a title = 'Translate Post' target = '_blank' href = 'https://translate.google.com/#zh-CN/en/"+t.text+"' class = 'translate is-pulled-right'><i class = 'fas fa-language'></i></a><br><p class = 'text'>"+(null==t.text?"[This post contained an image]":t.text)+"</p><br><div class = 'level'><div class = 'level-left'><span>LAST SEEN:</span>&nbsp;"+getTimeDelta(t.retrieved)+" ("+t.retrieved+")</div><div class = 'level-right'><a class = 'ext-link' href = '"+t.link+"' target = '_blank'><i class = 'fas fa-external-link-alt'></i></a></div></div>"})}function displayTrends(t){d3.select("#trends").selectAll("li").data(t).enter().append("li").html(function(t){return t.term+"<span>("+t.meaning+")</span>"})}function convertToCommas(t){return t.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}var postsUpdated=!1;function updatePosts(){$("#loading").show(),$.get("https://cs.dpccdn.net/v1/censored_posts",function(t){d3.select("#posts").selectAll("*").remove(),displayPosts(t.posts,t.lastUpdated),displayTrends(t.trends.slice(0,10)),$("#urls-monitored").html(convertToCommas(t.sourceUrls.length)),$("#total-posts-collected").html(convertToCommas(t.stats.total.total)),$("#potentially-censored").html(convertToCommas(t.stats.total.censored)),drawPie([t.stats.mostRecent.visible,t.stats.mostRecent.censored],"recent-pie","Recent Posts"),drawPie([t.stats.total.visible,t.stats.total.censored],"all-pie","All Collected Posts"),$("#loading").hide(),$("#sidebar").css("display","block"),$("#post-column").css("display","block"),$("#at-a-glance").css("display","block"),postsUpdated=!0})}$(document).ready(function(){updatePosts()});var loading=!1;$(window).scroll(function(){postsUpdated&&!loading&&$(window).scrollTop()>=$(document).height()-$(window).height()-100&&(loading=!0,currentI<rangeI?$("#container-"+ ++currentI).css("display","block"):$("#end-message").show(),loading=!1)});
Handlebars.registerHelper('currentSongVisual', function(provider, artwork_url){
  var result;
  if(provider === "YouTube") {
    result = "<div id='youtube-video'>Loading</div>"
  } else {
    result = "<img class='player__soundcloud-artwork' src='" +artwork_url+ "' />"
  }

  return new Handlebars.SafeString(result);
});
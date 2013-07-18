Handlebars.registerHelper('currentSongVisual', function(provider, artwork_url){
  var result;
  if(provider === "YouTube") {
    result = "<div id='youtube-video'>Loading</div><img src='" +artwork_url+ "' />"
  } else {
    result = "<img class='player__soundcloud-artwork' src='" +artwork_url+ "' />"
  }

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('feedName', function(feedId){
  return new Handlebars.SafeString(
    App.feeds.get(feedId).get('title')
  );
});

Handlebars.registerHelper('joinFeedNames', function(entries){
  var feedNames = _(entries).map(function(entry){
    return App.feeds.get(entry.feed_id).get('title');
  });

  return new Handlebars.SafeString(feedNames.join(', '));
});

Handlebars.registerHelper('joinFeedNamesWithLink', function(entries){
  var feedNames = _(entries).map(function(entry){
    var feedName = App.feeds.get(entry.feed_id).get('title');
    return "<a target='blank' href='"+entry.link+"'>"+feedName+"</a>";
  });

  return new Handlebars.SafeString(feedNames.join(', '));
});
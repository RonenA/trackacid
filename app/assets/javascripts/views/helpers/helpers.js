Handlebars.registerHelper('buildDownloadLink', function(url ,provider) {
  if (provider === "SoundCloud"){
    return new Handlebars.SafeString(
      url+"?client_id="+API_KEYS.SoundCloud
    );
  }
});

Handlebars.registerHelper('currentSongVisual', function(provider, artwork_url) {
  var result;
  if(provider === "YouTube") {
    result = "<div id='youtube-video'>Loading</div>"
  } else {
    result = "<img class='player__soundcloud-artwork' src='" +artwork_url+ "' />"
  }

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('feedName', function(feedId) {
  return new Handlebars.SafeString(
    App.feeds.get(feedId).get('title')
  );
});

Handlebars.registerHelper('joinFeedNames', function(entries) {
  var feedNames = _(entries).map(function(entry){
    return App.feeds.get(entry.feed_id).get('title') + " "
            + "<span class='song__time-ago'>"
            + $.timeago(entry.published_at)
            + "</span>";
  });

  return new Handlebars.SafeString(feedNames.join(', '));
});

Handlebars.registerHelper('joinFeedNamesWithLink', function(entries) {
  var feedNames = _(entries).map(function(entry){
    var feedName = App.feeds.get(entry.feed_id).get('title');
    return feedName + " <a target='blank' href='"+entry.link+"'>" +
            $.timeago(entry.published_at) + "</a>";
  });

  return new Handlebars.SafeString(feedNames.join(', '));
});

Handlebars.registerHelper('firstEntryLink', function(entries) {
  return new Handlebars.SafeString(entries[0].link);
});
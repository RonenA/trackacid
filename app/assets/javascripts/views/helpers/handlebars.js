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
    result = "<img id='youtube-video' class='player__img' src='" +artwork_url+ "' />"
  } else {
    result = "<img class='player__img' src='" +artwork_url+ "' />"
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
    return App.feeds.get(entry.feed_id).get('title');
  });

  return new Handlebars.SafeString(feedNames.join(', '));
});

Handlebars.registerHelper('feedNamesForPlayer', function(entries) {
  var firstEntry = entries[0];
  var firstFeedName = App.feeds.get(firstEntry.feed_id).get('title');
  var result = "Blogged by " +
               "<a href='#/feeds/" + firstEntry.feed_id + "'>" +
               firstFeedName + "</a> <a target='blank' href='"+firstEntry.link+"'>" +
                  $.timeago(firstEntry.published_at) + "</a>";

  //Todo: add a tooltip to see the others on hover;
  if (entries.length > 1) {
    result = result + ", and " + (entries.length - 1) + " other";
    if (entries.length > 2) result = result + "s";
  }

  return new Handlebars.SafeString(result);
});

//TODO: No longer in use
Handlebars.registerHelper('firstEntryLink', function(entries) {
  return new Handlebars.SafeString(entries[0].link);
});

Handlebars.registerHelper('firstEntryTimeAgo', function(entries) {
  return new Handlebars.SafeString( $.timeago(entries[0].published_at) );
});

Handlebars.registerHelper('totalUnheardCount', function(feeds) {
  var count = feeds.reduce(function(memo, feed) {
                if (feed.unheard_count === "") return memo;
                return memo + feed.unheard_count;
              }, 0);

  if (count == 0) count = "";
  return new Handlebars.SafeString(count);
});

Handlebars.registerHelper('msToTimestamp', function(ms) {
  var rawSeconds = ms/1000;
  var result = "";

  //Hours
  if (rawSeconds > 3600) {
    var result = Math.floor(rawSeconds/3600) + ":";
    var rawSeconds = rawSeconds%3600;
    //Pad the minutes if there is an hour
    var minutes = App.Helpers.padForTime(Math.floor(rawSeconds/60));
  } else {
    var minutes = Math.floor(rawSeconds/60);
  }
  var seconds = App.Helpers.padForTime(Math.floor(rawSeconds%60));

  var result = result + minutes + ":" + seconds;

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('titleIconClass', function(kind) {
  if (kind === "playlist") {
    return new Handlebars.SafeString('icon-list');
  }
});

Handlebars.registerHelper('spinner', function(provider) {
  if (!App.Models.Song.providerInfo[provider].hasOwnSpinner) {
    var spinner = '<i class="player__spinner icon-spinner animate-spin"></i>';
    return new Handlebars.SafeString(spinner);
  }
});
//TODO: Organize by view

Handlebars.registerHelper('ifCurrentUser', function(options) {
  return App.currentUser ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('unlessCurrentUser', function(options) {
  return !App.currentUser ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifFollowingAnyBlogs', function(options) {
  return App.feeds.length > 0 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifPositive', function(value, options) {
  if (options && options.fn) {
    //For calling helper block style
    //{{#ifPositive val}} something {{/ifPositive}}
    return value > 0 ? options.fn(this) : options.inverse(this);
  } else {
    //For calling helper regularly {{{ifPositive val}}} --> val
    if (value > 0) return value;
  }
});


Handlebars.registerHelper('contactEmail', function() {
  return new Handlebars.SafeString('contact@trackacid.com');
});

Handlebars.registerHelper('capitalize', function(string) {
  return new Handlebars.SafeString(string.capitalize());
});

//Used in feed index
Handlebars.registerHelper('selectedFeedClass', function(selectedFeedId, id) {
  if (selectedFeedId == id) {
    return new Handlebars.SafeString('selected');
  }
});

//Used in browse feeds
Handlebars.registerHelper('feedToggleSubscriptionButton', function(id, loading) {
  var userHasFeed = !!App.feeds.get(id);
  var button = $("<button>").addClass('btn float-right');

  if (userHasFeed) {
    button.addClass('js-unsubscribe-feed btn--hollow btn--red');
    var s = $('<span>').addClass('standard-text').html("<i class='icon-check'></i> Following");
    var h = $('<span>').addClass('hover-text').html("<i class='icon-cancel'></i> Unfollow");
    button.append(s, h);
  } else {
    button.addClass('js-subscribe-feed');
    var icon = $("<i>").addClass(loading ? 'icon-spinner animate-spin' : 'icon-plus');
    var span = $("<span>").append(icon, "Follow");
    button.html(span);
  }
  return new Handlebars.SafeString(button.prop('outerHTML'));
});

Handlebars.registerHelper('feedFavicon', function(url) {
  return new Handlebars.SafeString('<img src="http://g.etfv.co/'+url+'">');
});

Handlebars.registerHelper('buildDownloadLink', function(url, provider) {
  if (provider === "SoundCloud"){
    return new Handlebars.SafeString(
      url+"?client_id="+API_KEYS.SoundCloud
    );
  }
});

Handlebars.registerHelper('currentSongVisual', function(provider, artworkUrl) {
  var result;
  if (artworkUrl === null) {
    artworkUrl = App.defaultArtworkUrl;
  }

  if(provider === "YouTube") {
    result = "<img id='youtube-video' class='player__img' src='" +artworkUrl+ "' />"
  } else {
    result = "<img class='player__img' src='" +artworkUrl+ "' />"
  }

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('feedName', function(feedId) {
  return new Handlebars.SafeString(
    App.feeds.get(feedId).get('title')
  );
});

Handlebars.registerHelper('joinFeedNames', function(entries, ownedByUser) {

  var feedNames = _(entries).map(function(entry){
    //Have to make sure the feed actually exists.
    //If the user deleted the feed, there may still be entries
    //from the deleted feed in the other songs.

    //TODO: Might make sense to remove all of those offending entries
    //when a feed is deleted, either by manually killing them or
    // just reloading all the songs.
    var feed = App.allFeeds.get(entry.feed_id)
    if (feed) return feed.get('title');
  });

  feedNames = _.compact(feedNames);
  feedNames = _.uniq(feedNames);

  return new Handlebars.SafeString(feedNames.join(', '));
});

Handlebars.registerHelper('feedNamesForPlayer', function(entries, ownedByUser) {
  //TODO: This should be done on the backend

  if (ownedByUser) {
    entries = _(entries).select(function(entry) {
      return App.feeds.get(entry.feed_id);
    });
  }

  if(!entries.length) return;

  var firstEntry = entries[0];
  var firstFeedName = App.allFeeds.get(firstEntry.feed_id).get('title');
  var result = "Blogged by <a target='blank' href='" + firstEntry.link+"'>" +
                  firstFeedName + " " +
                  $.timeago(firstEntry.published_at) + "</a>";

  //Todo: add a tooltip to see the others on hover;
  if (entries.length > 1) {
    result = result + ", and " + (entries.length - 1) + " other";
    if (entries.length > 2) result = result + "s";
  }

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('firstEntryLink', function(entries) {
  if (entries.length) return new Handlebars.SafeString(entries[0].link);
});

Handlebars.registerHelper('firstEntryTimeAgo', function(entries) {
  if (entries.length) return new Handlebars.SafeString( $.timeago(entries[0].published_at) );
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


Handlebars.registerHelper('spinner', function(provider) {
  if (!App.Models.Song.providerInfo[provider].hasOwnSpinner) {
    var spinner = '<i class="player__spinner icon-spinner animate-spin"></i>';
    return new Handlebars.SafeString(spinner);
  }
});

Handlebars.registerHelper('playerPublicLinkText', function(kind) {
  if (kind === "playlist") {
    return new Handlebars.SafeString("Hear the rest on");
  } else {
    return new Handlebars.SafeString("View on");
  }
});

//used by both songlist and player
Handlebars.registerHelper('songKindBadge', function(kind) {
  if (kind === "playlist") {
    return new Handlebars.SafeString(
      "<span class='icon-list badge'>Playlist</span>"
    );
  }
});

//used by song
Handlebars.registerHelper('songArtwork', function(artworkUrl) {
  if (artworkUrl === null) {
    artworkUrl = App.defaultArtworkUrl;
  }

  return new Handlebars.SafeString("<img src='"+artworkUrl+"'>")
});

Handlebars.registerHelper('songsEmptyMessage', function(context) {
  var message;

  if (context.favorites) {
    message = "No songs favorited"
  } else if (context.user.hide_heard_songs) {
    message = "No new songs"
  } else {
    message = "No songs"
  }

  return new Handlebars.SafeString(message);
});
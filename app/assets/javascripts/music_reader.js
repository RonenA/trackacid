window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  Helpers: {},
  initialize: function() {

    if ($('#user-json').length) {
      App.currentUser = JSON.parse($('#user-json').html());
    }

    App.feeds = new App.Collections.Feeds(
      JSON.parse($('#feed-json').html())
    );

    App.SONGS_PER_PAGE = parseInt($('#songs-per-page').html());
    App.songs = new App.Collections.Songs(
      JSON.parse($('#song-json').html())
    );

    App.$rootEl = $('.l-root');
    App.router = new App.Routers.Main();

    Backbone.history.start();
  },
  defaultArtworkUrl: '/assets/default_artwork.svg',
  allFeeds: function() {

    if (!App._allFeeds) {
      App._allFeeds = new $.Deferred();

      $.ajax({
        url: "/feeds?all=true",
        success: function(feeds) {
          App._allFeeds.resolve(new App.Collections.Feeds(feeds));
        },
        error: function(jqXHR, textStatus, errorThrown) {
          App.Alerts.new("error", "Could not load feeds due to: " + errorThrown);
        },
      });
    }

    return App._allFeeds;
  }
};

$(document).ready(function(){
  App.Alerts.initalize();

  if ($('#start-app').length) {
    App.initialize();
  } else {
    $('input, textarea').placeholder();
  }

  $.ajaxSetup({
    beforeSend: function( xhr ) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    }
  });
});
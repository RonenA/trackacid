window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    SC.initialize({
      client_id: API_KEYS.SoundCloud
    });

    App.currentUser = JSON.parse($('#user-json').html());

    App.feeds = new App.Collections.Feeds(
      JSON.parse($('#feed-json').html())
    );

    App.songs = new App.Collections.Songs(
      JSON.parse($('#song-json').html())
    );

    App.router = new App.Routers.Main({
      $rootEl: $('.l-root')
    });

    Backbone.history.start();
  }
};

$(document).ready(function(){
  App.initialize();
});
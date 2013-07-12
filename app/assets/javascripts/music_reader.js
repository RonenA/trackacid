window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    SC.initialize({
      client_id: '33e780b8fadb971a1cd5793866664a05'
    });

    App.feeds = new App.Collections.Feeds();
    App.songs = new App.Collections.Songs(
      JSON.parse($('#song-json').html())
    );

    App.router = new App.Routers.Main({
      $rootEl: $('#content')
    });

    Backbone.history.start();
  }
};

$(document).ready(function(){
  App.initialize();
});

App.Routers.Main = Backbone.Router.extend({

  routes: {
    ""          : "all",
    "feeds/:id" : "feedShow"
  },

  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  all: function() {
    if (App.mainView) App.mainView.songView.remove();
    this._initializeWithSongs(App.songs);
  },

  feedShow: function(id) {
    if (App.mainView) App.mainView.songView.remove();
    var feedSongs = App.songs.select(function(song) {
      return _(song.get('entries')).any(function(entry) {
        return entry.feed_id === parseInt(id);
      });
    });

    var feedSongCollection = new App.Collections.Songs(feedSongs, {feedId: id});
    this._initializeWithSongs(feedSongCollection);
  },

  _initializeWithSongs: function(songs) {
    App.mainView = new App.Views.Main({collection: songs});
    this.$rootEl.html( App.mainView.render().$el );

    var sidebar = new App.Views.Sidebar();
    this.$rootEl.prepend( sidebar.render().$el );

    this.setRootElHeight();
    $(window).resize(this.setRootElHeight.bind(this));
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    this.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

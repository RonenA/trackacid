App.Routers.Main = Backbone.Router.extend({

  routes: {
    ""          : "all",
    "favorites" : "favorites",
    "feeds/:id" : "feedShow"
  },

  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  all: function() {
    if (App.mainView) App.mainView.remove();
    this._initializeWithCollectionAndTitle(App.songs, "All");
  },

  favorites: function() {
    if (App.mainView) App.mainView.remove();
    var favoriteCollection = new App.Collections.Songs([], {feedId: "favorites"});
    this._initializeWithCollectionAndTitle(favoriteCollection, "Favorites");
  },

  feedShow: function(id) {
    if (App.mainView) App.mainView.remove();
    var feedSongs = App.songs.select(function(song) {
      return _(song.get('entries')).any(function(entry) {
        return entry.feed_id === parseInt(id);
      });
    });

    var feedSongCollection = new App.Collections.Songs(feedSongs, {feedId: id});
    var feedTitle = App.feeds.get(id).get('title');
    this._initializeWithCollectionAndTitle(feedSongCollection, feedTitle);
  },

  _initializeWithCollectionAndTitle: function(collection, title) {
    App.mainView = new App.Views.Main({collection: collection, title: title});
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

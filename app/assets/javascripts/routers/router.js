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
    this._initializeWithCollectionAndTitle(App.songs, "All");
  },

  favorites: function() {
    var favoriteSongs = App.songs.select(function(song) {
      return song.get("favorited");
    });

    var favoriteCollection = new App.Collections.Songs(favoriteSongs, {feedId: "favorites"});
    this._initializeWithCollectionAndTitle(favoriteCollection, "Favorites");
  },

  feedShow: function(id) {
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
    if (App.mainView) App.mainView.remove();

    App.mainView = new App.Views.Main({collection: collection, title: title});
    this.$rootEl.html( App.mainView.render().$el );

    var sidebar = new App.Views.Sidebar();
    this.$rootEl.prepend( sidebar.render().$el );
    sidebar.initializeTypeahead();

    this.setRootElHeight();
    $(window).resize(this.setRootElHeight.bind(this));
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    this.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

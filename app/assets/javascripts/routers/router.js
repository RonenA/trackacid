App.Routers.Main = Backbone.Router.extend({

  routes: {
    ""          : "all",
    "favorites" : "favorites",
    "feeds/:id" : "feedShow"
  },

  initialize: function() {
  },

  all: function() {
    this._initializeWithCollection(App.songs);
  },

  favorites: function() {
    var favoriteSongs = App.songs.select(function(song) {
      return song.get("favorited");
    });

    var favoriteCollection = new App.Collections.Songs(favoriteSongs, {feedId: "favorites"});
    this._initializeWithCollection(favoriteCollection);
  },

  feedShow: function(id) {
    var feedSongs = App.songs.select(function(song) {
      return _(song.get('entries')).any(function(entry) {
        return entry.feed_id === parseInt(id);
      });
    });

    var feedSongCollection = new App.Collections.Songs(feedSongs, {feedId: id});
    this._initializeWithCollection(feedSongCollection);
  },

  _initializeWithCollection: function(collection) {
    //Use the collection inside the player if there is a player,
    //because it has the correctly selected current song
    if (App.playerView && collection.feedId === App.playerView.collection.feedId) {
      collection = App.playerView.collection;
    }

    if(App.songIndexView) App.songIndexView.remove();
    App.songIndexView = new App.Views.SongIndex({collection: collection});
    if ($('.l-main').length) {
      $('.l-main').replaceWith( App.songIndexView.render().$el );
    } else {
      App.$rootEl.append( App.songIndexView.render().$el );
    }
    App.songIndexView.bindInfiniteScroll();

    if (!$('.l-sidebar').length) {
      var sidebar = new App.Views.Sidebar();
      App.$rootEl.append( sidebar.render().$el );
      //TODO should not be routers responsibility
      sidebar.initializeTypeahead();
    }

    this.setRootElHeight();
    $(window).resize(this.setRootElHeight.bind(this));
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    App.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

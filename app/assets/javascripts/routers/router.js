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

    if (App.playerView) {
      App.songIndexView.remove();
      if (collection.feedId === App.playerView.collection.feedId) {
        collection = App.playerView.collection;
      }
      App.songIndexView = new App.Views.SongIndex({collection: collection, title: title});

      //TODO: This line is really bad and makes a lot assumptions
      //about the DOM and app structure. The songIndexView must
      //be below the player in the DOM for the css to work. This
      //code assumes that there is never anything other than the
      //player and the songIndex inside l-main.
      $('.l-main').append( App.songIndexView.render().$el );

    } else {
      App.songIndexView = new App.Views.SongIndex({collection: collection, title: title});
      //TODO: It is concerning that the router is generating HTML.
      var main = $("<div>").addClass('l-main').html( App.songIndexView.render().$el );
      this.$rootEl.html( main );
      App.songIndexView.bindInfiniteScroll();

      var sidebar = new App.Views.Sidebar();
      this.$rootEl.prepend( sidebar.render().$el );
      //TODO should not be routers responsibility
      sidebar.initializeTypeahead();

      this.setRootElHeight();
      $(window).resize(this.setRootElHeight.bind(this));
    }
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    this.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

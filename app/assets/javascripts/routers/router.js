App.Routers.Main = Backbone.Router.extend({

  routes: {
    ""          : "root",
    "favorites" : "favorites",
    "feeds/:id" : "feedShow",
    "browse"    : "browseFeeds"
  },

  initialize: function() {
    this.$sidebarEl = $("<div>").addClass("l-sidebar");
    this.$mainEl = $("<div>").addClass("l-main");
    App.$rootEl.append( this.$sidebarEl );
    App.$rootEl.append( this.$mainEl );

    $(document).on('keydown.keyboardShortcuts', this.keyControlHandler.bind(this));
  },

  keyControlHandler: function(e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag != 'input' && tag != 'textarea') {
      if (App.playerView) {
        switch(e.which) {
          case 74:  //J
              App.playerView.continuePlaylist('next');
            break;
          case 39: //right
              App.playerView.continuePlaylist('next');
            break;
          case 75: //K
              App.playerView.continuePlaylist('prev');
            break;
          case 37: //left
              App.playerView.continuePlaylist('prev');
            break;
          case 32: //space
              App.playerView.togglePlay();
            break;
          case 70: //f
              App.playerView.toggleSongFavorited();
            break;
          case 27: //esc
              App.playerView.remove();
            break;
        }

      } else if (this.mainView &&
                 this.mainView.kind === "SongIndex" &&
                 _([74, 75, 32, 37, 39]).include(e.which)) {
        this.mainView.collection.setIndex(0);
        App.Views.Player.create( this.mainView.collection );
      }
    }

  },

  root: function() {
    if (App.currentUser) {
      this._initializeWithCollection(App.songs);
    } else {
      this.home();
    }
  },

  home: function() {
    this.mainView = new App.Views.SongIndex({collection: App.songs});

    this.loading();
    this.$mainEl.html( this.mainView.render().$el );

    this.initializeSidebar();
    this.$sidebarEl.addClass('is-wider');

    this.bindWindowResize();
  },

  favorites: function() {
    var favoriteSongs = App.songs.select(function(song) {
      return song.get("favorited");
    });

    var favoriteCollection = new App.Collections.Songs(favoriteSongs, {feedId: "favorites"});
    this._initializeWithCollection(favoriteCollection);
  },

  feedShow: function(id) {
    this.loading();

    id = parseInt(id);
    var that = this;
    var feedSongs;
    var feed = new $.Deferred();

    var usersFeed = App.feeds.get(id);
    if (usersFeed) { //if the user has this feed
      feed.resolve(usersFeed);

      feedSongs = App.songs.select(function(song) {
        return _(song.get('entries')).any(function(entry) {
          return entry.feed_id === id;
        });
      });
    } else {
      //TODO: This uses Deferreds even though it doesn't need to
      //because I changed allFeeds to be bootstrapped. Need to
      //remove the defered structure.
      feed.resolve( App.allFeeds.get(id) );
      feedSongs = [];
    }

    feed.done(function(feed){
      if (!feed) {
        App.Alerts.new("error", "Feed not found");
        that.navigate("", {trigger: true});
      } else {
        var options = {feedId: id};
        if (!usersFeed) options.feed = feed;
        var feedSongCollection = new App.Collections.Songs(feedSongs, options);
        that._initializeWithCollection(feedSongCollection);
      }
    });
  },

  _initializeWithCollection: function(collection) {
    var that = this;

    //Use the collection inside the player if there is a player,
    //because it has the correctly selected current song
    if (App.playerView && App.playerView.collection.feedId === collection.feedId) {
      collection = App.playerView.collection;
    }

    if(this.mainView) this.mainView.remove();

    this.loading();
    collection.ready.done(function(){
      that.mainView = new App.Views.SongIndex({collection: collection});
      that.$mainEl.html( that.mainView.render().$el );

      that.initializeSidebar(collection);

      that.bindWindowResize();
    });
  },

  browseFeeds: function() {
    if(this.mainView) this.mainView.remove();
    this.loading();

    this.mainView = new App.Views.BrowseFeeds({collection: App.allFeeds});
    this.$mainEl.html( this.mainView.render().$el );

    this.initializeSidebar();

    this.bindWindowResize();
  },

  initializeSidebar: function(mainCollection, options) {
    options = options || {};

    this.$sidebarEl.removeClass('is-wider'); //if you want it there, add it after calling this

    if (this.sidebarView) {
      //This method rerenders and updates the subview's collection.
      //We prefer this instead of just insantiating a new sidebar view
      //because the logo image would flash when switching feeds.
      this.sidebarView.changeMainCollection(mainCollection);
    } else {
      this.sidebarView = new App.Views.Sidebar({mainCollection: mainCollection});
      this.$sidebarEl.html( this.sidebarView.render().$el );
    }
  },

  loading: function() {
    this.$mainEl.html( HandlebarsTemplates['layouts/loading']() );
  },

  bindWindowResize: function() {
    this.setRootElHeight();

    if (!this.windowResizeBound) {
      $(window).resize(this.setRootElHeight.bind(this));
      this.windowResizeBound = true;
    }
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    App.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

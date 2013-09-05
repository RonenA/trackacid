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
          case 75: //K
              App.playerView.continuePlaylist('prev');
            break;
          case 32: //space
              App.playerView.togglePlay();
            break;
          case 27: //esc
              App.playerView.remove();
            break;
        }

      } else if (this.mainView &&
                 this.mainView.kind === "SongIndex" &&
                 _([74, 75, 32]).include(e.which)) {
        this.mainView.collection.setIndex(0);
        App.Views.Player.create( this.mainView.collection );
      }
    }

  },

  root: function() {
    if (App.currentUser) {
      this._initializeWithCollection(App.songs);
    } else {
      this.mainView = new App.Views.SongIndex({collection: App.songs});

      //Only animate for home page
      this.$mainEl.addClass('animated bounceInLeft');
      window.setTimeout(function(){
        this.$mainEl.removeClass('animated bounceInLeft');
      }, 1000);

      this.$mainEl.html( this.mainView.render().$el );

      this.initializeSidebar();
      this.$sidebarEl.addClass('is-wider');

      this.bindWindowResize();
    }
  },

  signupModal: function() {
    alert("TODO: modal");
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
    var that = this;
    if(this.mainView) this.mainView.remove();
    this.loading();


    $.ajax({
      url: "/feeds?all=true",
      success: function(feeds) {
        that.mainView = new App.Views.BrowseFeeds({collection: feeds});
        that.$mainEl.html( that.mainView.render().$el );

        that.initializeSidebar();

        that.bindWindowResize();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        App.Alerts.new("error", "Could not load feeds due to: " + errorThrown);
      },
    });
  },

  initializeSidebar: function(mainCollection) {
    if (this.sidebarView) this.sidebarView.remove();
    this.$sidebarEl.removeClass('is-wider'); //if you want it there, add it after calling this
    this.sidebarView = new App.Views.Sidebar({mainCollection: mainCollection});
    this.$sidebarEl.html( this.sidebarView.render().$el );
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

App.Views.SongIndex = Backbone.View.extend({

  className: "song-list__outer",
  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-delete-song':              'deleteSong',
    'click .js-select-song':              'selectSong',
    'click .js-toggle-song-listened':     'toggleSongListened',
    'dblclick .js-toggle-song-listened':   function(){return false},
    'click .js-toggle-song-favorited':    'toggleSongFavorited',
    'dblclick .js-toggle-song-favorited':  function(){return false},
    'click .js-mark-all-as-heard':        'markAllAsHeard',
    'click .js-toggle-view-heard':        'toggleViewHeard',
    'click .js-unsubscribe-feed':         'unsubscribeFeed'
  },

  initialize: function() {
    this.$listEl = $("<ul>").addClass("song-list l-main__list");
    this.$headerEl = $("<div>").addClass("song-list__header");
    this.$el.prepend( this.$listEl );
    this.$el.prepend( this.$headerEl );

    this.listenTo(this.collection, "add change:listened remove reset changeIndex", this.render);

    if(this.collection.feedId === "favorites"){
      this.listenTo(this.collection, "change:favorited", this.changeFavoritedHandler);
    }
  },

  render: function() {
    this.renderHeader();
    this.renderList();
    return this;
  },

  renderList: function() {
    var songs = this.collection.toJSON();
    if (!!this.collection.currentIdx) {
      songs[this.collection.currentIdx].selected = true;
    }
    var result = this.template({songs: songs});

    var oldScrollPosition = this.$listEl.scrollTop();
    this.$listEl.html(result);
    this.$listEl.scrollTop(oldScrollPosition);
  },

  renderHeader: function() {
    var context = {feed: this.collection.feedData(), user: App.currentUser};
    var result = HandlebarsTemplates['songs/song_list_header'](context);
    this.$headerEl.html( result );
  },

  bindInfiniteScroll: function() {
    this.$listEl.scroll(this.infiniteScrollHandler.bind(this));
  },

  infiniteScrollHandler: function(e) {
    var target = $(e.currentTarget);
    if (target.scrollTop() + target.innerHeight() >= target[0].scrollHeight - 1) {
      this.collection.loadNextPage();
    }
  },

  _modelFromTarget: function(target) {
    var id = target.closest('.song-list > li').data('id');
    return this.collection.get(id);
  },

  selectSong: function(e) {
    e.preventDefault();
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    var newIdx = this.collection.indexOf(model);
    this.collection.setIndex(newIdx);

    if (!App.playerView) {
      App.playerView = new App.Views.Player({collection: this.collection});
      this.$el.before( App.playerView.render().$el );
    } else {
      App.playerView.changeCollection( this.collection );
    }
  },

  deleteSong: function(e) {
    var that = this;
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    target.closest('.song-list > li').addClass('is-removing');
    //Wait for the animation, its so pretty
    window.setTimeout(function(){
      //TODO: duplication with below
      if (that.collection.indexOf(model) < that.collection.currentIdx) {
        that.collection.currentIdx--;
      }
      model.destroy();
    }, 500);
  },

  toggleSongListened: function(e) {
    var target = $(e.currentTarget);
    this.toggleSongAttribute("listened", target);
  },

  toggleSongFavorited: function(e) {
    var target = $(e.currentTarget);
    this.toggleSongAttribute("favorited", target);
  },

  changeFavoritedHandler: function(model, value, options) {
    //If you are toggling from inside the favorites,
    //lets remove it from the list.

    var that = this;
    if (value === false) {
      $(".song-list > li[data-id="+model.id+"]").addClass('is-removing');
      window.setTimeout(function(){
        if (that.collection.indexOf(model) < that.collection.currentIdx) {
          that.collection.currentIdx--;
        }
        that.collection.remove(model);
      }, 500);
    }
  },

  toggleSongAttribute: function(attribute, target) {
    var listItem = target.closest('.song-list > li');
    var model = this._modelFromTarget(target);

    listItem.toggleClass('is-'+attribute);
    model.setAndPersist(attribute, !model.get(attribute));
  },

  markAllAsHeard: function() {
    this.collection.markAllAsHeard();
  },

  toggleViewHeard: function() {
    var that = this;
    $.ajax({
      type: 'PUT',
      url: '/users/settings',
      data: {
        settings: {
          hide_heard_songs: !App.currentUser.hide_heard_songs
        }
      },
      success: function() {
        App.currentUser.hide_heard_songs = !App.currentUser.hide_heard_songs;
        that.collection.resetAndSeed();
        that.renderHeader();
      },
      error: function() {
        //TODO: Handle error
      }
    });
  },

  unsubscribeFeed: function() {
    this.collection.feed().destroy();
    App.router.navigate("", {trigger: true});
    if(App.playerView && App.playerView.collection === this.collection) {
      App.playerView.remove();
    }
  }

});
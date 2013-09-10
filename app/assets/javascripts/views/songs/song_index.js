App.Views.SongIndex = Backbone.View.extend({

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
    'click .js-unsubscribe-feed':         'unsubscribeFeed',
    'click .js-follow-feed':              'followFeed'
  },

  initialize: function() {
    this.kind = "SongIndex";

    this.$listEl = $("<ul>").addClass("song-list l-main__list");
    this.$headerEl = $("<div>").addClass("header");
    this.$el.prepend( this.$listEl );
    this.$el.prepend( this.$headerEl );

    this.listenTo(this.collection, "add change:listened change:favorited reset changeIndex", this.render);
    this.listenTo(this.collection, "remove", this.removeHandler);
    this.listenTo(this.collection, "startLoading", this.showSpinner);
    this.listenTo(this.collection, "endLoading", this.hideSpinner);
  },

  render: function() {
    var that = this;
    this.renderHeader();

    if (this.collection.feedId === "all" && App.feeds.length === 0) {
      this.notFollowingAnyBlogs();
    } else {
      this.renderList();
    }

    //Set timeout so that it is inserted into the DOM
    //before it tries to bind the scroll event;
    window.setTimeout(function(){
      that.bindInfiniteScroll();
    });

    return this;
  },

  renderList: function() {
    this.removeTooltips();

    var songs = this.collection.toJSON();

    if (this.collection.currentIdx !== null) {
      songs[this.collection.currentIdx].selected = true;
    }

    var result = this.template({
      songs: songs,
      user: App.currentUser,
      favorites: this.collection.feedId === "favorites"
    });

    var oldScrollPosition = this.$listEl.scrollTop();
    this.$listEl.html(result);
    this.$listEl.scrollTop(oldScrollPosition);

    this.bindTooltips();
  },

  notFollowingAnyBlogs: function() {
    this.$listEl.html( HandlebarsTemplates['songs/not_following_any_blogs']() );
  },

  renderHeader: function() {
    var context = {feed: this.collection.feedData(),
                   user: App.currentUser};
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

  bindTooltips: function() {
    this.$listEl.find('.song__controls > button, .song__controls > a').tooltip({
      placement: 'top',
      container: '.l-main',
      offsetTop: 25
    });
  },

  removeTooltips: function() {
    var tooltipped = this.$listEl.find('.song__controls > button, .song__controls > a');

    if (tooltipped.data() && tooltipped.data()['bs.tooltip']) {
      tooltipped.tooltip('destroy');
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
      App.Views.Player.create( this.collection );
    } else {
      App.playerView.changeCollection( this.collection );
    }
  },

  removeHandler: function(model, collection, options) {
    $(".song-list > li[data-id="+model.id+"]").addClass('is-removing');
    //Wait for the animation, its so pretty
    window.setTimeout(this.renderList.bind(this), 500);
  },

  deleteSong: function(e) {
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    model.destroy();
  },

  toggleSongListened: function(e) {
    var target = $(e.currentTarget);
    this.toggleSongAttribute("listened", target);
  },

  toggleSongFavorited: function(e) {
    if (App.currentUser) {
      var target = $(e.currentTarget);
      this.toggleSongAttribute("favorited", target);
    } else {
      App.router.signupModal();
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
      error: function(jqXHR, textStatus, errorThrown) {
        App.Alerts.new("error", "Settings could not be saved due to: " + errorThrown);
      },
    });
  },

  unsubscribeFeed: function() {
    this.collection.feed.destroy();
    App.router.navigate("", {trigger: true});
  },

  followFeed: function() {
    App.Models.Feed.follow(this.collection.feed.id, {
      success: this.render.bind(this)
    });
  },

  showSpinner: function() {
    this.$listEl.addClass('is-loading');
    this.$listEl[0].scrollTop = this.$listEl[0].scrollHeight;
  },

  hideSpinner: function() {
    this.$listEl.removeClass('is-loading');
  }

});
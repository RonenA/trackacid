App.Views.Main = Backbone.View.extend({
  className: "l-main",
  template: HandlebarsTemplates['layouts/main'],

  events: {
    'click .js-play':               'play',
    'click .js-pause':              'pause',
    'click .js-navigate-playlist':  'navigatePlaylist',
  },

  initialize: function(){
    this.songListView = new App.Views.SongIndex({collection: this.collection});

    this.listenTo(this.collection, "changeIndex", this.changeSongHandler);
    this.listenTo(this.collection, "remove", this.removeHandler);
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.renderSongList();
    this.renderCurrentSong();
    return this;
  },

  //Call this, not render again
  //because renderSongList should only
  //be called once, otherwise events
  //get unbound.
  rerenderComponents: function(){
    this.renderCurrentSong();
    this.songListView.render();
  },

  renderCurrentSong: function() {
    var that = this;
    if (this.collection.length > 0){
      if (this.songView) this.songView.remove();
      this.songView = this.makeSongView();
      var content = this.songView.render().$el;
      this.$el.find('#t-current-song').html( content );
      window.setTimeout(function() {
        //setTimeout prevents race condition of
        //youtube trying to load before the router
        //inserts #youtube-video into the DOM
        that.songView.startLoadingSound();
      });
    } else {
      //TODO: This probably wont look very good
      this.$el.find('#t-current-song').html( "No songs." );
    }
  },

  makeSongView: function() {
    return new App.Views.CurrentSong({
      model: this.collection.currentSong(),
      doneCallback: this.continuePlaylist.bind(this)
    });
  },

  renderSongList: function() {
    var songListContent = this.songListView.render().$el;
    this.$el.find('#t-song-list').html(songListContent);
    this.songListView.bindInfiniteScroll();
  },

  play: function() {
    this.songView.play();
    //TODO: investigate this monkeybusiness
    this.songView.playToPause();
  },

  pause: function() {
    this.songView.pause();
  },

  navigatePlaylist: function(e) {
    var target = $(e.currentTarget);
    this.continuePlaylist( target.data('direction') );
  },

  continuePlaylist: function(direction) {
    var that = this;
    var delta = (direction === "prev") ? -1 : 1;
    var songReady;

    if(that.collection.currentIdx + delta >= that.collection.length) {
      songReady = that.collection.loadNextPage();
    }
    songReady = songReady || $.Deferred.now();

    songReady.done(function() {
      if (delta === 1) {
        that.collection.currentSong().recordListen();
      }
      that.collection.currentIdx += delta;

      that.rerenderComponents();
      that.play();
    });
  },

  changeSongHandler: function() {
    this.songView.remove();
    this.rerenderComponents();
    this.play();
  },

  removeHandler: function(model) {
    var songViewWasPlaying = this.songView.playing();
    if(model === this.songView.model) {
      this.rerenderComponents();
      if (songViewWasPlaying) this.play();
    }
  }

});
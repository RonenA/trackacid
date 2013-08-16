App.Views.Main = Backbone.View.extend({
  className: "l-main",
  template: HandlebarsTemplates['layouts/main'],

  initialize: function(options){
    this.songListView = new App.Views.SongIndex({collection: this.collection});
    this.title = options.title;

    this.listenTo(this.collection, "changeIndex", this.changeSongHandler);
    this.listenTo(this.collection, "remove", this.removeHandler);
    //If the collection is empty, and then you add stuff, we need to reset the
    //current song. But if there is already shit in it, don't reset current song
    //cause then you'll lose your position in the song when infinite scrolling.
    this.listenTo(this.collection, "add", function(model, collection, options) {
      if (options.previousLength === 0) this.renderCurrentSong();
    });
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.renderSongList();
    //When loading the first song, the sound is loaded
    //in the background before the user presses play,
    //so we don't want the spinner.
    this.renderCurrentSong({suppressSpinner: true});
    this.renderHeader();
    return this;
  },

  remove: function() {
    if (this.songView) this.songView.remove();
    this.$el.remove();
    this.stopListening();
    return this;
  },

  //Call this, not render again
  //because renderSongList should only
  //be called once, otherwise events
  //get unbound.
  rerenderComponents: function() {
    this.renderCurrentSong();
    this.songListView.render();
    this.renderHeader();
  },

  renderCurrentSong: function(options) {
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
        that.songView.startLoadingSound(options);
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
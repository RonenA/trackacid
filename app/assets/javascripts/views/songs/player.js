App.Views.Player = Backbone.View.extend({

  className: "player l-bottom-full",

  events: {
    'click .js-play':                     'play',
    'click .js-pause':                    'pause',
    'click .js-navigate-playlist':        'navigatePlaylist',
    'click .js-delete-song':              'deleteSong',
    'click .js-toggle-song-listened':     'toggleSongListened',
    'dblclick .js-toggle-song-listened':   function(){return false},
    'click .js-toggle-song-favorited':    'toggleSongFavorited',
    'dblclick .js-toggle-song-favorited':  function(){return false},

  },

  initialize: function(options) {
    this.listenTo(this.collection, "changeIndex", function(newIdx) {
      (newIdx === null) ? this.remove() : this.render();
    });

    this.listenTo(this.collection, "remove", this.removeHandler);

    this.$visualEl = $('<div>');
    this.$infoEl = $('<div>');
    this.$el.append( this.$visualEl );
    this.$el.append( this.$infoEl );
  },

  changeCollection: function(newCollection) {
    this.collection = newCollection;
    this.render();
  },

  remove: function() {
    this.stopListening();
    $(document).off('keydown.keyboardShortcuts');
    this.destroySound();
    this.$el.remove();

    this.collection.setIndex(null);

    App.playerView = undefined;
    return this;
  },

  destroySound: function() {
    this.sound.done(function(sound) {
      //Before we needed this to avoid errors,
      //now we dont'. Lots of mystery errors
      //in the YouTube code.

      if(sound.provider !== "YouTube"){
        sound.destroy();
      }
    });
  },

  setCurrentSong: function() {
    if (this.currentSong) this.stopListening(this.currentSong);
    this.currentSong = this.collection.currentSong();

    if (this.currentSong) {
      this.listenTo(this.currentSong, "change", function(){
        this.renderInfo( this.renderingContext() );
      });
    } else {
      this.remove();
    }
  },

  render: function() {
    //Youtube vid's done use this class
    //and if its there, it breaks pause();
    //TODO: This is messy
    this.$el.removeClass('is-loading');

    this.setCurrentSong();
    if (!this.currentSong) return this;

    this.startLoadingSound();

    var song = this.renderingContext();
    this.renderVisual(song);
    this.renderInfo(song);

    this.play();

    return this;
  },

  renderingContext: function() {
    var song = this.currentSong.toJSON();
    _(song.entries).each(function(entry) {
      entry.feed = App.feeds.get(entry.feed_id).toJSON();
    });

    song.playing = this.playing();

    //This is pretty hacky. The song_control partial needs
    //to know if its being rendered for the song list or
    //for the player. This is how that's achieved.
    song.forPlayer = true;

    return song;
  },

  renderVisual: function(context) {
    var result = HandlebarsTemplates['player/visual'](context);
    this.$visualEl.html(result);
  },

  renderInfo: function(context) {
    this.removeTooltips();
    var result = HandlebarsTemplates['player/info'](context);
    this.$infoEl.html(result);
    this.bindTooltips();
  },

  bindTooltips: function() {
    this.$infoEl.find('.song__controls > button, .song__controls > a').tooltip({
      placement: 'top',
      container: 'body',
      offsetTop: 25
    });
  },

  removeTooltips: function() {
    var tooltipped = this.$infoEl.find('.song__controls > button, .song__controls > a');

    if (tooltipped.data() && tooltipped.data()['bs.tooltip']) {
      tooltipped.tooltip('destroy');
    }
  },

  startLoadingSound: function(options) {
    var that = this;
    if (this.sound) this.destroySound();
    this.sound = new $.Deferred();

    var options = options || {};

    //If the song has its own spinner, like a youtube video,
    //we don't want to have a handler to turn on the spinner.
    if (!this.currentSong.hasOwnSpinner()) {
      var startBuffering = this.showSpinner.bind(this);
      var endBuffering = this.hideSpinner.bind(this);

      //Start the spinner before the sound even starts loading
      //because there is time between startLoadingSound() and
      //the triggering of the buffering event.
      this.showSpinner();
    }

    this.currentSong.startLoadingSound({
      onplay: this.playToPause.bind(this),
      onpause: this.pauseToPlay.bind(this),
      onfinish: this.continuePlaylist.bind(this),
      onstartbuffering: startBuffering,
      onendbuffering: endBuffering
    }).done(function(sound){
      that.sound.resolve(sound);
    });
  },

  play: function() {
    var that = this;
    this.sound.done(function(sound) {
      if (!sound.playing()){
        sound.play();
        //TODO: this may not be nessesary
        //It was in main.js though.
        that.playToPause();
      }
    });
  },

  pause: function() {
    //Pausing during loading causes all sorts of terrible
    //double playing issues that I cant figure out how to
    //deal with, so for now you can't do that.
    //The reason I'm using the DOM instead of the sound
    //object to determine if it is loading is because the
    //dom object handles both buffering and loading, and
    //I found the object state to be less reliable.
    if (this.$el.hasClass('is-loading')) return;

    this.sound.done(function(sound) {
      sound.pause();
    });
  },

  playing: function() {
    var bool;

    if (this.sound.state() === 'resolved') {
      this.sound.done(function(sound) {
        bool = sound.playing();
      });
    } else {
      // Treat a not yet loaded sound as playing
      // because being loaded is the same as buffering,
      // and buffering is treated the same as playing.
      bool = true;
    }
    return bool;
  },

  togglePlay: function() {
    if (this.playing()) {
      this.pause();
    } else {
      this.play();
    }
  },

  _togglePlayPauseButton: function(button) {
    button.toggleClass('js-play js-pause');
    button.find('i').toggleClass('icon-play icon-pause');
  },

  playToPause: function() {
    this._togglePlayPauseButton( $('.js-play') );
  },

  pauseToPlay: function() {
    this._togglePlayPauseButton( $('.js-pause') );
  },

  navigatePlaylist: function(e) {
    var target = $(e.currentTarget);
    this.continuePlaylist( target.data('direction') );
  },

  continuePlaylist: function(direction) {
    var that = this;
    var delta = (direction === "prev") ? -1 : 1;
    that.collection.incrementIndex(delta);
  },

  showSpinner: function() {
    this.$el.addClass('is-loading');
  },

  hideSpinner: function() {
    this.$el.removeClass('is-loading');
  },

  removeHandler: function(model) {
    var songViewWasPlaying = this.playing();
    if(model === this.currentSong) {
      this.render();
      if (songViewWasPlaying) this.play();
    }
  },

  deleteSong: function() {
    this.currentSong.destroy();
  },

  toggleSongListened: function() {
    this.currentSong.setAndPersist("listened", !this.currentSong.get("listened"));
  },

  toggleSongFavorited: function() {
    this.currentSong.setAndPersist("favorited", !this.currentSong.get("favorited"));
  }

});

App.Views.Player.create = function(collection) {
  App.playerView = new App.Views.Player({collection: collection});
  App.$rootEl.prepend( App.playerView.render().$el );
}
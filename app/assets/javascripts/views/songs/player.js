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

    //TODO: This shouldn't be in the player view
    //because then you can't use the controls until
    //you open the player.
    _.bindAll(this);
    $(document).on('keydown.keyboardShortcuts', this.keyControlHandler);
  },

  changeCollection: function(newCollection) {
    if (this.collection !== newCollection) {
      this.collection = newCollection;
      this.render();
    }
  },

  remove: function() {
    this.stopListening();
    $(document).off('keydown.keyboardShortcuts');
    this.removeSound();
    this.$el.remove();
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
    this.listenTo(this.currentSong, "change", function(){
      this.renderInfo( this.renderingContext() );
    });
  },

  render: function() {
    this.setCurrentSong();

    var song = this.renderingContext();
    this.renderVisual(song);
    this.renderInfo(song);

    if (!this.currentSong.hasOwnSpinner()) this.showSpinner();
    this.startLoadingSound();
    this.play();

    return this;
  },

  renderingContext: function() {
    var song = this.currentSong.toJSON();
    _(song.entries).each(function(entry) {
      entry.feed = App.feeds.get(entry.feed_id).toJSON();
    });

    return song;
  },

  renderVisual: function(context) {
    var result = HandlebarsTemplates['player/visual'](context);
    this.$visualEl.html(result);
  },

  renderInfo: function(context) {
    var result = HandlebarsTemplates['player/info'](context);
    this.$infoEl.html(result);
  },

  startLoadingSound: function(options) {
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
      if(!options.suppressSpinner){
        this.showSpinner();
      }
    }

    this.sound.become(this.currentSong.startLoadingSound({
      onplay: this.playToPause.bind(this),
      onpause: this.pauseToPlay.bind(this),
      onfinish: this.continuePlaylist.bind(this),
      onstartbuffering: startBuffering,
      onendbuffering: endBuffering
    }));
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
    this.sound.done(function(sound) {
      sound.pause();
    });
  },

  playing: function() {
    var bool;
    this.sound.done(function(sound) {
      bool = sound.playing();
    });
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

    if (delta === 1) {
      that.currentSong.recordListen();
    }

    that.collection.incrementIndex(delta);
  },

  showSpinner: function() {
    this.$el.addClass('is-loading');
  },

  hideSpinner: function() {
    this.$el.removeClass('is-loading');
  },

  keyControlHandler: function(e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag != 'input' && tag != 'textarea'){
      switch(e.which) {
      case 74:
        this.continuePlaylist('next');
        break;
      case 75:
        this.continuePlaylist('prev');
        break;
      case 32:
        this.togglePlay();
        break;
      }
    }
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
App.Views.CurrentSong = Backbone.View.extend({

  template: HandlebarsTemplates['songs/current_song'],

  initialize: function(options) {
    this.doneCallback = options.doneCallback;
    this.sound = new $.Deferred();
  },

  remove: function() {
    var that = this;
    this.stopListening();
    this.sound.done(function(sound) {
      sound.destroy();
      that.$el.remove();
    });
    return this;
  },

  render: function() {
    var that = this;

    var song = that.model.toJSON();
    _(song.entries).each(function(entry) {
      entry.feed = App.feeds.get(entry.feed_id).toJSON();
    });

    var content = that.template(song);
    that.$el.html(content);

    return this;
  },

  startLoadingSound: function() {
    //If the song has its own spinner, like a youtube video,
    //we don't want to have a handler to turn on the spinner.
    if (!this.model.hasOwnSpinner()) {
      var startBuffering = this.showSpinner.bind(this);
      var endBuffering = this.hideSpinner.bind(this);

      //Start the spinner before the sound even starts loading
      //because there is time between startLoadingSound() and
      //the triggering of the buffering event.
      this.showSpinner();
    }

    this.sound.become(this.model.startLoadingSound({
      onplay: this.playToPause.bind(this),
      onpause: this.pauseToPlay.bind(this),
      onfinish: this.doneCallback,
      onstartbuffering: startBuffering,
      onendbuffering: endBuffering
    }));
  },

  play: function() {
    this.sound.done(function(sound) {
      if (!sound.playing()){
        sound.play();
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

  //TODO: Its kind of weird that songShow touches
  //the play button, which is strictly part of
  //songIndex.
  togglePlayPause: function(button) {
    button.toggleClass('js-play js-pause');
    button.find('i').toggleClass('icon-play icon-pause');
  },

  playToPause: function() {
    this.togglePlayPause( $('.js-play') );
  },

  pauseToPlay: function() {
    this.togglePlayPause( $('.js-pause') );
  },

  showSpinner: function() {
    $('.js-player-spinner').show();
  },

  hideSpinner: function() {
    $('.js-player-spinner').hide();
  }

});
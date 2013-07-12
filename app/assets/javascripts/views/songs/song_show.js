App.Views.SongShow = function(options) {
  var provider = options.model.get('provider');
  return new App.Views[provider+"Song"](options);
}

App.Views.ProviderSong = Backbone.View.extend({

  initialize: function(options) {
    this.doneCallback = options.doneCallback;
    this.loadingSound = new $.Deferred();
  },

  remove: function() {
    //this.$el.remove();
    //This line causes a fatal error in the YouTube code.
    //It is part of the default BackBone remove so I don't
    //want to completely remove it.
    this.stopListening();
    this.loadingSound.done(function(sound) {
      sound.stop();
    });
    return this;
  },

  render: function() {
    var that = this;

    that.$el.html("loading");

    this.model.dataFromProvider().done(function(songData){
      var content = that.template(songData);
      that.$el.html(content);
    });

    return this;
  },

  loadSound: function() {
    var that = this;

    this.model.sound().done(function(sound) {
      that.loadingSound.resolve(sound);
    });
  },

  play: function() {
    var that = this;

    this.loadingSound.done(function(sound) {
      sound.play({ onfinish: that.doneCallback });
    });
  },

  pause: function() {
    this.loadingSound.done(function(sound) {
      sound.pause();
    });
  }

});

App.Views.SoundCloudSong = App.Views.ProviderSong.extend({

  template: HandlebarsTemplates['songs/soundcloud'],

});

App.Views.YouTubeSong = App.Views.ProviderSong.extend({

  template: HandlebarsTemplates['songs/youtube'],

});
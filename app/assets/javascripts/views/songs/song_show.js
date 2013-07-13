App.Views.SongShow = function(options) {
  var provider = options.model.get('provider');
  return new App.Views[provider+"Song"](options);
}

App.Views.ProviderSong = Backbone.View.extend({

  initialize: function(options) {
    this.doneCallback = options.doneCallback;
    this.sound = new $.Deferred();
  },

  remove: function() {
    this.$el.remove();
    //This line causes a fatal error in the YouTube code.
    //It is part of the default BackBone remove so I don't
    //want to completely remove it.
    this.stopListening();
    this.sound.done(function(sound) {
      sound.stop();
    });
    return this;
  },

  render: function() {
    var that = this;

    that.$el.html("loading");

    this.model.dataFromProvider().done(function(songData) {
      var content = that.template(songData);
      that.$el.html(content);
    });

    return this;
  },

  startLoadingSound: function() {
    this.sound.become(this.model.startLoadingSound());
  },

  play: function() {
    var that = this;

    this.sound.done(function(sound) {
      sound.play({ onfinish: that.doneCallback });
    });
  },

  pause: function() {
    this.sound.done(function(sound) {
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
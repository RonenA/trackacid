App.Views.SongShow = function(options) {
  var provider = options.model.get('provider');
  return new App.Views[provider+"Song"](options);
}

App.Views.ProviderSong = Backbone.View.extend({

  events: {
    'click .js-delete-song': 'deleteSong'
  },

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
    that.$el.html("loading");

    this.model.dataFromProvider().done(function(songData) {
      var song = that.model.toJSON();
      _(song.entries).each(function(entry) {
        entry.feed = App.feeds.get(entry.feed_id).toJSON();
      });

      var content = that.template({data: songData,
                                   song: song});
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
      if (!sound.playing()){
        sound.play({ onfinish: that.doneCallback });
      }
    });
  },

  pause: function() {
    this.sound.done(function(sound) {
      sound.pause();
    });
  },

  deleteSong: function() {
    this.model.destroy();
  }

});

App.Views.SoundCloudSong = App.Views.ProviderSong.extend({

  template: HandlebarsTemplates['songs/soundcloud'],

});

App.Views.YouTubeSong = App.Views.ProviderSong.extend({

  template: HandlebarsTemplates['songs/youtube'],

});
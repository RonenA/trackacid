App.Models.Song = Backbone.Model.extend({

  toJSON: function(options) {
    var json = _.clone(this.attributes);
    //Make sure the entries are in order of date
    json.entries = _(json.entries).sortBy(function(entry) {
      return new Date(entry.published_at);
    });
    return json;
  },

  dataFromProvider: function() {
    // TODO: handle errors
    // Currently, this is only used when a soundcloud song
    // is actaully a playlist and we need to get the most
    // popular song from that playlist.
    var that = this;
    this._dataFromProvider = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {
      SC.get( this.get('source_url'),
        function(response){
          that._dataFromProvider.resolve(response);
        }
      );
    } else if (this.get('provider') === "YouTube") {
      this._dataFromProvider.resolve({});
    }

    return this._dataFromProvider;
  },

  startLoadingSound: function(options) {
    //TODO: Handle errors here
    var that = this;
    var sound = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {

      var id = new $.Deferred();

      if(this.get('kind') === "playlist") {
        this.dataFromProvider().done(function(data){
          //Use the most popular track if it is a playlist
          var bestTrackId = _(data.tracks).sortBy(function(track){
            return track.favoritings_count;
          }).reverse()[0].id;

          id.resolve(bestTrackId);
        });
      } else if (this.get('kind') === "track") {
        id.resolve(that.get('id_from_provider'));
      }

      id.done(function(id){
        SC.stream( "/tracks/"+id,
          {
            onplay: options.onplay,
            onpause: options.onpause,
            onfinish: options.onfinish,
            onbufferchange: function(){
              if (this.isBuffering) {
                options.onstartbuffering();
              } else {
                options.onendbuffering();
              }
            }
          },
          function(response){
            sound.resolve(new App.Models.SoundCloudSound(response));
          }
        );
      });

    } else if (this.get('provider') === "YouTube") {
      App.YouTubeReady.done(function(){
        //setTimeout so that this doesn't try to happen
        //before #youtube-video is rendered.
        window.setTimeout(function(){
          new YT.Player('youtube-video', {
            height: '200',
            width: '200',
            videoId: that.get('id_from_provider'),
            playerVars: {
              controls: 0,
              showinfo: 0
            },
            events: {
              'onReady': function(e) {
                sound.resolve(new App.Models.YouTubeSound(e.target));
              },
              'onStateChange': function(e) {
                if (e.data === YT.PlayerState.PLAYING ||
                    e.data === YT.PlayerState.BUFFERING) {
                  options.onplay();
                }

                if (e.data === YT.PlayerState.PAUSED) {
                  options.onpause();
                }

                if (e.data === YT.PlayerState.ENDED) {
                  options.onfinish();
                }
              }
            }
          });
        });

      });
    }

    return sound;
  },

  recordListen: function() {
    this.setAndPersist("listened", true);
  },

  removeListen: function() {
    this.setAndPersist("listened", false);
  },

  recordFavorite: function() {
    this.setAndPersist("favorited", true);
  },

  removeFavorite: function() {
    this.setAndPersist("favorited", false);
  },

  setAndPersist: function(attribute, value) {
    if(this.get(attribute) !== value) {
      this.set(attribute, value);

      $.ajax({
        type: (value ? "POST" : "DELETE"),
        url: this.url()+"/"+App.Models.Song.attributeToResource[attribute],
        error: function() {
          //TODO: Handle error
        }
      });

      if(attribute === "listened") this.updateFeedUnheardCount(value);
    }
  },

  updateFeedUnheardCount: function(isListened) {
    _(this.get('entries')).each(function(entry) {
      var feed = App.feeds.get(entry.feed_id);
      feed.changeUnheardCount(isListened ? -1 : 1);
    });
  },

  hasOwnSpinner: function() {
    return App.Models.Song.providerInfo[this.get("provider")].hasOwnSpinner;
  }

});

App.Models.Song.providerInfo = {
  SoundCloud: {
    hasOwnSpinner: false
  },
  YouTube: {
    hasOwnSpinner: true
  }
};

App.Models.Song.attributeToResource = {
  listened: "listen",
  favorited: "favorite"
}
App.Models.Song = Backbone.Model.extend({

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

      if(this.get('kind') === "playlist"){
        this._dataFromProvider.done(function(data){
          //Use the most popular track if it is a playlist
          var bestTrackId = _(data.tracks).sortBy(function(track){
            return track.favoritings_count;
          })[0].id

          id.resolve(bestTrackId);
        });
      } else if (this.get('kind') === "track"){
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
    }

    return sound;
  },

  recordListen: function() {
    if(!this.get('listened')){
      this.set('listened', true);

      $.ajax({
        type: "POST",
        url: this.url()+"/listen",
        error: function() {
          //TODO: Handle error
        }
      });
    }
  },

  removeListen: function() {
    if(this.get('listened')){
      this.set('listened', false);

      $.ajax({
        type: "DELETE",
        url: this.url()+"/listen",
        error: function() {
          //TODO: Handle error
        }
      });
    }
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
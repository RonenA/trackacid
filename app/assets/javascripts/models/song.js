App.Models.Song = Backbone.Model.extend({

  dataFromProvider: function() {
    // TODO: handle errors
    var that = this;
    this.dataFromProvider = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {
      SC.get( this.get('url'),
        function(response){
          that.dataFromProvider.resolve(response);
        }
      );
    } else if (this.get('provider') === "YouTube") {
      this.dataFromProvider.resolve({});
    }

    return this.dataFromProvider;
  },

  startLoadingSound: function() {
    var that = this;
    var sound = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {
      this.dataFromProvider.done(function(data){
        if(data.kind === "playlist"){
          //Use the most popular track if it is a playlist
          var url = _(data.tracks).sortBy(function(track){
            return track.favoritings_count;
          })[0].uri
        } else if (data.kind === "track"){
          var url = that.get('url')
        }

        SC.stream( url,
          function(response){
            sound.resolve(new App.Models.SoundCloudSound(response));
          }
        );
      });
    } else if (this.get('provider') === "YouTube") {
      var videoId = this.get('url').match(/\/embed\/([^\?\/]*)/)[1];

      App.YouTubeReady.done(function(){
        new YT.Player('youtube-video', {
          height: '200',
          width: '200',
          videoId: videoId,
          events: {
            'onReady': function(e){
              sound.resolve(new App.Models.YouTubeSound(e.target));
            }
          }
        });
      });
    }

    return sound;
  },

  recordListen: function(){
    if(!this.get('listened')){
      this.set('listened', true);

      $.ajax({
        type: "POST",
        url: this.url()+"/listen",
        error: function(){
          //TODO: Handle error
        }
      });
    }
  }

});
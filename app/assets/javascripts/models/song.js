App.Models.Song = Backbone.Model.extend({

  dataFromProvider: function() {
    // TODO: handle errors
    var that = this;
    var data = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {
      SC.get( this.get('url'),
        function(response){
          data.resolve(response);
        }
      );
    } else if (this.get('provider') === "YouTube") {
      data.resolve({});
    }

    return data;
  },

  startLoadingSound: function() {
    var that = this;
    var sound = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {
      SC.stream( this.get('url'),
        function(response){
          sound.resolve(response);
        }
      );
    } else if (this.get('provider') === "YouTube") {
      var videoId = this.get('url').match(/\/embed\/([^\?\/]*)/)[1];
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
    }

    return sound;
  }

});
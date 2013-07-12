App.Views.SongIndex = Backbone.View.extend({

  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-play':  'play',
    'click .js-pause': 'pause',
    'click .js-next':  'next',
    'click .js-prev':  'prev'
  },

  initialize: function() {
    this.listenTo(this.collection, "sync", this.render);
    this.currentIdx = 0;
    this.currentSongObject = null;
  },

  render: function() {
    var content = this.template({songs: this.collection.toJSON()});
    this.$el.html(content);
    return this;
  },

  currentSong: function() {
    return this.collection.at(this.currentIdx);
  },

  play: function() {
    if (this.currentSongObject){
      this.currentSongObject.play();
    } else {
      this.continuePlaylist();
    }
  },

  continuePlaylist: function(direction) {
    var direction = direction || 'next';

    var that = this;
    var currentSong = that.currentSong();
    var url = currentSong.get('url');

    if(currentSong.get('provider') === "soundcloud"){
      SC.stream( url,
        function(song){
          that.currentSongObject = song;
          that._playSong(song);
        }
      );
    } else if(currentSong.get('provider') === "youtube") {
      var videoId = url.match(/\/embed\/([^\?\/]*).*/)[1];

      var videoTarget = $('<div>').attr('id', 'song');
      this.$el.append(videoTarget);

      player = new YT.Player('song', {
        height: '200',
        width: '200',
        videoId: videoId,
        events: {
          'onReady': function(e){
            e.target.playVideo();
          }
        }
      });
    } else {
      that[direction]();
    }
  },

  _playSong: function(song) {
    song.play({ onfinish: this.next.bind(this) });
  },

  next: function() {
    if (this.currentSongObject) this.currentSongObject.stop();
    this.currentIdx++;
    this.continuePlaylist();
  },

  prev: function() {
    if (this.currentSongObject) this.currentSongObject.stop();
    this.currentIdx--;
    this.continuePlaylist('prev');
  },

  pause: function() {
    this.currentSongObject.pause();
  }

});
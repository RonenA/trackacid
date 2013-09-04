App.Models.YouTubeSound = function() {

  function YouTubeSound(object){
    this.object = object;
    this.provider = "YouTube";
  };

  YouTubeSound.prototype.play = function(options) {
    var options = options || {};

    this.object.playVideo();

    // This allows you to set event handlers when calling play,
    // as you can with soundcloud, although this is no longer
    // used at the moment because the event handlers are set
    // during the object's creation.
    this.object.addEventListener('onStateChange', function(e) {
      if (options.onfinish && e.data === YT.PlayerState.ENDED) {
        options.onfinish();
      }

      if (options.onpause && e.data === YT.PlayerState.PAUSED) {
        options.onpause();
      }
    });
  };

  YouTubeSound.passToObject({
    pause:   'pauseVideo',
    stop:    'stop',
    destroy: 'destroy'
  });

  YouTubeSound.prototype.playing = function() {
    // unstarted (-1), ended (0), playing (1), paused (2),
    // buffering (3), video cued (5).

    return this.object.getPlayerState() === YT.PlayerState.PLAYING;
  };

  YouTubeSound.prototype.buffering = function() {
    return this.object.getPlayerState() === YT.PlayerState.BUFFERING;
  };

  return YouTubeSound;

}();
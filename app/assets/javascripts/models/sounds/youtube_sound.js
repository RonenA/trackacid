App.Models.YouTubeSound = function() {

  function YouTubeSound(object){
    this.object = object;
  };

  YouTubeSound.prototype.play = function(options) {
    var options = options || {};

    this.object.playVideo();
    if (options.onfinish) {
      this.object.addEventListener('onStateChange', function(e) {
        if (e.data === YT.PlayerState.ENDED) {
          options.onfinish();
        }
      });
    }
  };

  YouTubeSound.passToObject({
    pause:   'pauseVideo',
    stop:    'stop',
    destroy: 'destroy'
  });

  YouTubeSound.prototype.playing = function() {
    // unstarted (-1), ended (0), playing (1), paused (2),
    // buffering (3), video cued (5).
    return _([1,3]).contains(this.object.getPlayerState);
  };

  return YouTubeSound;

}();
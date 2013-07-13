//Ducktypes YouTube video into SoundCloud sound

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

  YouTubeSound.prototype.pause = function() {
    this.object.pauseVideo();
  };

  YouTubeSound.prototype.stop = function() {
    this.object.stopVideo();
  };

  YouTubeSound.prototype.destruct = function() {
    this.object.destroy();
  };

  return YouTubeSound;

}();
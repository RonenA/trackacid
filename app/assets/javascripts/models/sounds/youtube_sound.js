App.Models.YouTubeSound = function() {

  function YouTubeSound(object, options){
    var YouTubeSound = this;
    this.object = object;
    this.options = options;
    this.provider = "YouTube";

    this.object.addEventListener('onStateChange', function(e){
      if (e.data === YT.PlayerState.PLAYING) {
        YouTubeSound.startPositionChecking();
      } else if (e.data === YT.PlayerState.PAUSED) {
        YouTubeSound.stopPositionChecking();
      }
    });

    // Do this before the video is done loading
    // because YouTube sometimes just never tells
    // you its playing.
    YouTubeSound.startPositionChecking();
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
    stop:    'stop'
  });

  YouTubeSound.prototype.playing = function() {
    // unstarted (-1), ended (0), playing (1), paused (2),
    // buffering (3), video cued (5).

    return this.object.getPlayerState() === YT.PlayerState.PLAYING;
  };

  YouTubeSound.prototype.buffering = function() {
    return this.object.getPlayerState() === YT.PlayerState.BUFFERING;
  };

  // Have to implement our own position change event for YouTube
  // Gets called peridically while the video is playing and calls
  // the onPositionChange callback. TODO: refactor with events.
  // Note: soundcloud calls this whileplaying, but onPositionChange
  // is used here so that setPosition can call it as well.

  var intervalTime = 250;

  YouTubeSound.prototype.startPositionChecking = function() {
    if (this.positionChecking) return;

    var YouTubeSound = this;
    this.positionChecking = window.setInterval(function() {
      var oldPosition = YouTubeSound.position,
          newPosition = YouTubeSound.object.getCurrentTime() * 1000;

      // Sometimes the position just gets stuck. I hate this API.
      // Better to update the progress bar with unreliable data
      // than to leave it stuck I guess.
      if (newPosition <= oldPosition) {
        YouTubeSound.position += intervalTime;
      } else {
        YouTubeSound.position = newPosition;
      }

      if (YouTubeSound.options.onPositionChange) {
        YouTubeSound.options.onPositionChange.bind(YouTubeSound)(YouTubeSound.position);
      }
    }, intervalTime);
  };

  YouTubeSound.prototype.stopPositionChecking = function() {
    window.clearInterval(this.positionChecking);
    this.positionChecking = null;
  }

  YouTubeSound.prototype.setPosition = function(positionMilliseconds) {
    this.position = positionMilliseconds;
    this.object.seekTo(positionMilliseconds / 1000, true);
    this.options.onPositionChange.bind(this)(positionMilliseconds);
  }

  YouTubeSound.prototype.destroy = function() {
    this.object.destroy();
    this.stopPositionChecking();
  }

  return YouTubeSound;

}();
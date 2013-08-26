App.Models.SoundCloudSound = function() {

  function SoundCloudSound(object){
    this.object = object;
    this.provider = "SoundCloud";
  };

  SoundCloudSound.passToObject({
    play:     'play',
    pause:    'pause',
    stop:     'stop',
    destroy:  'destruct'
  });

  //Treats buffering as playing deliberately. Only buffers
  //during playing, so for all intents and purposes it is playing.
  SoundCloudSound.prototype.playing = function() {
    return (this.object.playState === 1 || this.object.isBuffering) && !this.object.paused;
  };

  return SoundCloudSound;

}();

App.Models.SoundCloudSound = function() {

  function SoundCloudSound(object){
    this.object = object;
    this.provider = "SoundCloud";
  };

  SoundCloudSound.passToObject({
    play:     'play',
    pause:    'pause',
    stop:     'stop',
    setPosition: 'setPosition',
    destroy:  'destruct'
  });

  //Treats buffering as playing deliberately. Only buffers
  //during playing, so for all intents and purposes it is playing.
  SoundCloudSound.prototype.playing = function() {
    return this.object.playState === 1 && !this.object.paused;
  };

  SoundCloudSound.prototype.buffering = function() {
    return this.object.isBuffering;
  };

  return SoundCloudSound;

}();

App.Models.SoundCloudSound = function() {

  function SoundCloudSound(object){
    this.object = object;
  };

  SoundCloudSound.passToObject({
    play:     'play',
    pause:    'pause',
    stop:     'stop',
    destroy:  'destruct'
  });

  SoundCloudSound.prototype.playing = function() {
    return this.object.playState === 1 && !this.object.paused;
  };

  return SoundCloudSound;

}();

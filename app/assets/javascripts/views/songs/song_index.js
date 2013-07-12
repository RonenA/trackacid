App.Views.SongIndex = Backbone.View.extend({

  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-play':               'play',
    'click .js-pause':              'pause',
    'click .js-navigate-playlist':  'navigatePlaylist',
  },

  initialize: function() {
    var that = this;
    this.songViews = this.collection.map(function(song){
      return new App.Views.SongShow({
        model: song,
        doneCallback: that.continuePlaylist.bind(that)
      });
    });

    this.currentIdx = 0;
  },

  render: function() {
    var content = this.template({songs: this.collection.toJSON()});
    this.$el.html(content);
    this.renderCurrentSong();
    return this;
  },

  renderCurrentSong: function() {
    var content = this.currentSongView().render().$el;
    this.$el.find('#current-song').html( content );
    this.currentSongView().loadSound();
  },

  currentSongView: function() {
    return this.songViews[this.currentIdx];
  },

  play: function() {
    this.currentSongView().play();
  },

  pause: function() {
    this.currentSongView().pause();
  },

  continuePlaylist: function(direction) {
    this.currentSongView().remove();
    var delta = (direction === "prev") ? -1 : 1;

    this.currentIdx += delta;
    this.renderCurrentSong();
    this.currentSongView().play();
  },

  navigatePlaylist: function(e) {
    var target = $(e.currentTarget);
    this.continuePlaylist( target.data('direction') );
  },

});
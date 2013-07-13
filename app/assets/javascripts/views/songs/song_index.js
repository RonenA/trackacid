App.Views.SongIndex = Backbone.View.extend({

  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-play':               'play',
    'click .js-pause':              'pause',
    'click .js-navigate-playlist':  'navigatePlaylist',
  },

  initialize: function() {
    var that = this;

    this.listenTo(this.collection, "add", this.render);

    $(window).scroll(this.loadNextPage.bind(this));

    this.currentIdx = 0;
  },

  render: function() {
    var content = this.template({songs: this.collection.toJSON()});
    this.$el.html(content);
    this.renderCurrentSong();
    return this;
  },

  renderCurrentSong: function() {
    this.songView = this.makeSongView();

    var content = this.songView.render().$el;
    this.$el.find('#current-song').html( content );
    this.songView.startLoadingSound();
  },

  makeSongView: function() {
    return new App.Views.SongShow({
      model: this.collection.at(this.currentIdx),
      doneCallback: this.continuePlaylist.bind(this)
    });
  },

  play: function() {
    this.songView.play();
  },

  pause: function() {
    this.songView.pause();
  },

  continuePlaylist: function(direction) {
    var that = this;
    var delta = (direction === "prev") ? -1 : 1;
    var songReady;

    if(that.currentIdx + delta >= that.collection.length) {
      songReady = that.collection.loadNextPage();
    }
    songReady = songReady || $.Deferred.now();

    songReady.done(function() {
      that.songView.remove();
      that.currentIdx += delta;

      that.renderCurrentSong();
      that.songView.play();
    });
  },

  navigatePlaylist: function(e) {
    var target = $(e.currentTarget);
    this.continuePlaylist( target.data('direction') );
  },

  loadNextPage: function(e) {
    if (($(window).innerHeight() + $(window).scrollTop()) >= $("body").height()) {
      this.collection.loadNextPage();
    }
  }

});
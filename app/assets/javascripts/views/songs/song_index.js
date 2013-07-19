App.Views.SongIndex = Backbone.View.extend({

  className: "l-main",
  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-play':               'play',
    'click .js-pause':              'pause',
    'click .js-navigate-playlist':  'navigatePlaylist',
    'click .js-switch-song':        'switchSong',
    'click .js-delete-song':        'deleteSong'
  },

  initialize: function() {
    var that = this;

    this.listenTo(this.collection, "add", function(model, collection, options){
      that.render();
      if(options.scrollToPreviousPosition) {
        var songlist = $('.js-song-list-scroll');
        songlist.scrollTop(that.previousScrollTop);
      }
    });

    this.currentIdx = 0;
  },

  render: function() {
    var songs = this.collection.toJSON();
    songs[this.currentIdx].selected = true;
    var result = this.template({songs: songs});
    this.$el.html(result);
    this.renderCurrentSong();
    this.bindInfiniteScroll();
    return this;
  },

  bindInfiniteScroll: function() {
    $('.js-song-list-scroll').scroll(this.infiniteScrollHandler.bind(this));
  },

  currentSong: function() {
    return this.collection.at(this.currentIdx);
  },

  renderCurrentSong: function() {
    if (this.collection.length > 0){
      this.songView = this.makeSongView();
      var content = this.songView.render().$el;
      this.$el.find('#current-song').html( content );
      this.songView.startLoadingSound();
    } else {
      //TODO: This probably wont look very good
      this.$el.find('#current-song').html( "No songs." );
    }
  },

  makeSongView: function() {
    return new App.Views.CurrentSong({
      model: this.currentSong(),
      doneCallback: this.continuePlaylist.bind(this)
    });
  },

  play: function() {
    this.songView.play();
    this.songView.playToPause();
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
      if (delta === 1) {
        that.collection.at(that.currentIdx).recordListen();
      }
      that.currentIdx += delta;

      that.render();
      that.play();
    });
  },

  navigatePlaylist: function(e) {
    var target = $(e.currentTarget);
    this.continuePlaylist( target.data('direction') );
  },

  infiniteScrollHandler: function(e) {
    var target = $(e.currentTarget);
    if (target.scrollTop() + target.innerHeight() >= target[0].scrollHeight) {
      this.collection.loadNextPage();
      this.previousScrollTop = target.scrollTop();
    }
  },

  switchSong: function(e) {
    e.preventDefault();
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    this.currentIdx = this.collection.indexOf(model);
    this.songView.remove();
    this.renderCurrentSong();
    this._updateSelectionHighlight();
    this.play();
  },

  _updateSelectionHighlight: function(){
    $('.is-selected').removeClass('is-selected');
    var currentSongId = this.currentSong().id;
    $('.song-list').find('[data-id='+currentSongId+']').addClass('is-selected');
  },

  _modelFromTarget: function(target) {
    var id = target.closest('.song-list > li').data('id');
    return this.collection.get(id);
  },

  deleteSong: function(e) {
    var target = $(e.currentTarget);
    var currentSong = this.currentSong();
    var model = this._modelFromTarget(target);
    var songViewWasPlaying = this.songView.playing();
    model.destroy();

    target.closest('.song-list > li').addClass('is-removing');

    if(model === currentSong) {
      this.songView.remove();
      this.renderCurrentSong();
      this._updateSelectionHighlight();
      if (songViewWasPlaying) this.play();
    }
  }

});
App.Views.SongIndex = Backbone.View.extend({

  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-play':               'play',
    'click .js-pause':              'pause',
    'click .js-navigate-playlist':  'navigatePlaylist',
    'click .js-switch-song':        'switchSong'
  },

  initialize: function() {
    var that = this;

    this.listenTo(this.collection, "add", this.render);
    this.listenTo(this.collection, "remove", function(){
      that.songView.remove();
      that.render();
      that.play();
    })

    //TODO: Probably don't want this on the whole window
    $(window).scroll(this.loadNextPage.bind(this));

    this.currentIdx = 0;
  },

  render: function() {
    var songs = this.collection.toJSON();
    songs[this.currentIdx].playing = true;
    var result = this.template({songs: songs});
    this.$el.html(result);
    this.renderCurrentSong();
    return this;
  },

  renderCurrentSong: function() {
    if (this.collection.length > 0){
      this.songView = this.makeSongView();
      var content = this.songView.render().$el;
      this.$el.find('#current-song').html( content );
      this.songView.startLoadingSound();
    } else {
      this.$el.find('#current-song').html( "No songs." );
    }
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

  loadNextPage: function(e) {
    if (($(window).innerHeight() + $(window).scrollTop()) >= $("body").height()) {
      this.collection.loadNextPage();
    }
  },

  switchSong: function(e) {
    e.preventDefault();
    var target = $(e.currentTarget);
    this.currentIdx = target.data('index');
    this.songView.remove();
    this.render();
    this.play();
  }

});
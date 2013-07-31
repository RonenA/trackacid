App.Views.SongIndex = Backbone.View.extend({

  tagName: 'ul',
  className: 'song-list',
  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-delete-song':            'deleteSong',
    'click .js-switch-song':            'switchSong',
    'click .js-toggle-song-listened':   'toggleSongListened',
    'dblclick .js-toggle-song-listened': function(){return false}
  },

  initialize: function() {
    var that = this;

    this.listenTo(this.collection, "add", this.render);
  },

  render: function() {
    var songs = this.collection.toJSON();
    if (songs.length) songs[this.collection.currentIdx].selected = true;
    var result = this.template({songs: songs});

    var oldScrollPosition = this.$el.scrollTop();
    this.$el.html(result);
    this.$el.scrollTop(oldScrollPosition);
    return this;
  },

  bindInfiniteScroll: function() {
    this.$el.scroll(this.infiniteScrollHandler.bind(this));
  },

  infiniteScrollHandler: function(e) {
    var target = $(e.currentTarget);
    if (target.scrollTop() + target.innerHeight() >= target[0].scrollHeight) {
      this.collection.loadNextPage();
    }
  },

  _modelFromTarget: function(target) {
    var id = target.closest('.song-list > li').data('id');
    return this.collection.get(id);
  },

  switchSong: function(e) {
    e.preventDefault();
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    var newIdx = this.collection.indexOf(model);
    this.collection.setIndex(newIdx);
  },

  deleteSong: function(e) {
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    target.closest('.song-list > li').addClass('is-removing');
    //Wait for the animation, its so pretty
    window.setTimeout(function(){
      model.destroy();
    }, 500);
  },

  toggleSongListened: function(e) {
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);

    if (target.hasClass('is-listened')) {
      target.removeClass('is-listened');
      model.removeListen();
    } else {
      target.addClass('is-listened');
      model.recordListen();
    }
  }

});
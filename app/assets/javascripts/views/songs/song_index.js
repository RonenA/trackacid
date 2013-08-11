App.Views.SongIndex = Backbone.View.extend({

  tagName: 'ul',
  className: 'song-list l-main__list',
  template: HandlebarsTemplates['songs/index'],

  events: {
    'click .js-delete-song':              'deleteSong',
    'click .js-switch-song':              'switchSong',
    'click .js-toggle-song-listened':     'toggleSongListened',
    'dblclick .js-toggle-song-listened':   function(){return false},
    'click .js-toggle-song-favorited':    'toggleSongFavorited',
    'dblclick .js-toggle-song-favorited':  function(){return false},
  },

  initialize: function() {
    this.listenTo(this.collection, "add change:listened remove", this.render);

    if(this.collection.feedId === "favorites"){
      this.listenTo(this.collection, "change:favorited", this.changeFavoritedHandler);
    }
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
    var that = this;
    var target = $(e.currentTarget);
    var model = this._modelFromTarget(target);
    target.closest('.song-list > li').addClass('is-removing');
    //Wait for the animation, its so pretty
    window.setTimeout(function(){
      //TODO: duplication with below
      if (that.collection.indexOf(model) < that.collection.currentIdx) {
        that.collection.currentIdx--;
      }
      model.destroy();
    }, 500);
  },

  toggleSongListened: function(e) {
    var target = $(e.currentTarget);
    this.toggleSongAttribute("listened", target);
  },

  toggleSongFavorited: function(e) {
    var target = $(e.currentTarget);

    this.toggleSongAttribute("favorited", target);
  },

  changeFavoritedHandler: function(model, value, options) {
    //If you are toggling from inside the favorites,
    //lets remove it from the list.

    var that = this;
    if (!value) {
      $(".song-list > li[data-id="+model.id+"]").addClass('is-removing');
      window.setTimeout(function(){
        if (that.collection.indexOf(model) < that.collection.currentIdx) {
          that.collection.currentIdx--;
        }
        that.collection.remove(model);
      }, 500);
    }
  },

  toggleSongAttribute: function(attribute, target) {
    var listItem = target.closest('.song-list > li');
    var model = this._modelFromTarget(target);

    listItem.toggleClass('is-'+attribute);
    model.setAndPersist(attribute, !model.get(attribute));
  }

});
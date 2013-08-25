App.Collections.Songs = Backbone.Collection.extend({

  model: App.Models.Song,

  comparator: function(songA, songB) {
    if (songA.get("first_published_at") > songB.get("first_published_at")) return -1;
    if (songA.get("first_published_at") < songB.get("first_published_at")) return 1;
    return 0;
  },

  initialize: function(models, options) {
    var options = options || {};

    this.url = "/songs";
    this.feedId = options.feedId || "all";
    this.setDefaults();

    this.listenTo(this, "remove", this.removeHandler);

    if(this.feedId === "favorites"){
      this.listenTo(this, "change:favorited", this.changeFavoritedHandler);
    }

    //If you start off with very few items from this feed, and then
    //click the feed page, we'll need to get some more.
    if (this.feedId && this.length < 10) this.loadNextPage();
  },

  setDefaults: function() {
    this.loadMore = true;
    this.currentIdx = null;
  },

  feed: function() {
    return App.feeds.get(this.feedId);
  },

  feedData: function() {
    if (!isNaN(this.feedId)){
      return this.feed().toJSON();
    } else {
      return {
        title: this.feedId.capitalize()
      }
    }
  },

  removeHandler: function(model, collection, options) {
    if (options.index < this.currentIdx) {
      this.currentIdx--;
    }
  },

  changeFavoritedHandler: function(model, value, options) {
    //If you are toggling from inside the favorites,
    //lets remove it from the list.

    if (value === false) {
      this.remove(model);
    }
  },

  loadNextPage: function() {
    this.page = Math.floor(this.length/App.SONGS_PER_PAGE);

    if (this.loadMore) {
      var that = this;
      this.loadMore = false;

      return $.ajax({
        url: this.url,
        type: 'GET',
        data: {page   : this.page+1,
               feed_id: this.feedId},
        success: function(data) {
          if(data.length > 0) {
            that.add(data, {previousLength: that.length});
            that.loadMore = true;
            that.page++;
          }
        },
        error: function() {
          //TODO: Handle error
        }
      });
    } else {
      return $.Deferred.now();
    }
  },

  currentSong: function() {
    return this.at(this.currentIdx);
  },

  setIndex: function(newIdx) {
    var that = this;

    //If the new index is above the current index,
    //load the next page before triggering changeIndex.
    if (newIdx >= this.length) {
      deferred = this.loadNextPage();
    } else {
      deferred = $.Deferred.now();

      //If it is on the last item, preload the next
      //page, but no need to wait for it.
      if (newIdx === this.length - 1) this.loadNextPage();
    }

    deferred.done(function(){
      //If its still greater than the length after loading
      //the next page, set the index to null.
      that.currentIdx = (newIdx >= this.length ? null : newIdx);
      that.trigger("changeIndex", newIdx);
    });
  },

  incrementIndex: function(delta) {
    var newIdx = this.currentIdx + delta;
    this.setIndex(newIdx);
  },

  markAllAsHeard: function() {
    var that = this;
    $.ajax({
      url: '/feeds/'+this.feedId+'/listens',
      type: 'POST',
      success: function(feedData) {
        App.feeds.reset(feedData);
        _(that.where({listened: false})).each(function(song){
          song.set({listened: true}, {silent: true});
        });
        that.trigger('change:listened');
      },
      error: function() {
        //TODO: Handle error
      }
    });
  },

  resetAndSeed: function() {
    this.setDefaults();
    this.reset();
    this.loadNextPage();
  }

});
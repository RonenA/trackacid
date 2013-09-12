App.Collections.Songs = Backbone.Collection.extend({

  model: App.Models.Song,

  comparator: function(songA, songB) {
    if (songA.firstPublishedForFeed(this.feedId) > songB.firstPublishedForFeed(this.feedId)) return -1;
    if (songA.firstPublishedForFeed(this.feedId) < songB.firstPublishedForFeed(this.feedId)) return 1;
    return 0;
  },

  initialize: function(models, options) {
    var options = options || {};
    var that = this;

    //If you unfollow a feed but for some reason the usersong gets deleted,
    //it may cause js errors.
    for(var i=0; i < models.length; i++) {
      if (models[i] && models[i].entries && models[i].entries.length === 0) {
        models.splice(i, 1);
        i--;
      }
    }

    this.url = "/songs";
    this.feedId = options.feedId || "all";
    this.feed = options.feed || (App.feeds && App.feeds.get(this.feedId));
    this.setDefaults();

    this.listenTo(this, "remove", this.removeHandler);
    this.listenTo(this, "reset", this.setDefaults);

    if(this.feedId === "favorites"){
      this.listenTo(this, "change:favorited", this.changeFavoritedHandler);
    }

    //If you start off with very few items from this feed, and then
    //click the feed page, we'll need to get some more.
    if (this.length < 15){
      this.ready = this.loadNextPage();
    } else {
      this.ready = $.Deferred.now();
    }
  },

  setDefaults: function() {
    this.loadMore = true;
    this.currentIdx = null;
    this.page = Math.floor(this.length/App.SONGS_PER_PAGE);
  },

  feedData: function() {
    if (this.feed){
      var json = this.feed.toJSON();
      //If the feedId is not a number, the user owns the feed
      //If the feedId is a number, check if its in App.feeds
      json.ownedByUser = !!App.feeds.get(this.feedId);
      return json;
    } else {
      return {
        title: this.feedId.capitalize(),
        ownedByUser: true
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
    if (this.loadMore) {
      var that = this;
      this.loadMore = false;

      this.trigger('startLoading');

      return $.ajax({
        url: this.url,
        type: 'GET',
        data: {page   : this.page+1,
               feed_id: this.feedId},
        success: function(data) {
          if(data.length > 0) {
            data = _(data).reject(function(song){
              return !song.entries.length;
            });
            that.add(data, {previousLength: that.length});
            that.loadMore = true;
            that.page++;
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (errorThrown) {
            App.Alerts.new("error", "The songs could not be loaded due to: " + errorThrown);
          } else {
            App.Alerts.new("error", "Couldn't load songs - experiencing connection issues.");
          }
        },
        complete: function() {
          that.trigger('endLoading');
        }
      });
    } else {
      return $.Deferred.now();
    }
  },

  currentSong: function() {
    return this.at(this.currentIdx);
  },

  setIndex: function(newIdx, options) {
    var that = this;
    options = options || {};
    var deferred;

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
      var targetIdx = (newIdx >= that.length || newIdx < 0) ? null : newIdx;
      that.currentIdx = targetIdx;
      that.trigger("changeIndex", targetIdx, options);
    });
  },

  incrementIndex: function(delta) {
    var newIdx;

    //If you are trying to incrementIndex and the current index is null,
    //you probably triggered resetAndSeed on the current songs collection
    //while you were playing a sond that was removed by the reset.
    //So when that song in the player ended, it will try to go to the next
    //song in the collection by doing "null + 1" but that equals 1.
    //We want it to start at the beginning, so we need to set it to 0.
    if (this.currentIdx !== null) {
      newIdx = this.currentIdx + delta;
    } else {
      newIdx = 0;
    }
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
      error: function(jqXHR, textStatus, errorThrown) {
        App.Alerts.new("error", "Could not mark all as heard due to: " + errorThrown);
      },
    });
  },

  resetAndSeed: function() {
    var that = this;
    var oldCurrentSong = this.currentSong();
    this.reset();

    this.loadNextPage().done(function() {
      if (oldCurrentSong) {
        var newCurrentSong = that.get(oldCurrentSong.id);
        if (newCurrentSong) that.setIndex( that.indexOf(newCurrentSong), {ignorePlayer: true} );
      }
    });
  },

  filterHeard: function() {
    var that = this;
    this.each(function(song) {
      if (song.get('listened')) that.remove(song, {silent: true});
    });
  }

});
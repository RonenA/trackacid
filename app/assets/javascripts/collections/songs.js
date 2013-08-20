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
    }
  },

  currentSong: function() {
    return this.at(this.currentIdx);
  },

  setIndex: function(newIdx) {
    this.currentIdx = newIdx;
    this.trigger("changeIndex", newIdx);
  },

  incrementIndex: function(delta) {
    var that = this;
    var newIdx = this.currentIdx + delta;
    var deferred;

    if (newIdx > this.length) {
      deferred = this.loadNextPage();
    } else {
      deferred = $.Deferred.now();
    }

    //setIndex calls changeIndex, which
    //is an event that other views listen to.
    //We dont want those to try to use the new
    //index before the next page has actaully
    //been loaded.
    deferred.done(function(){
      //If newIdx is STILL larger than the length
      //there are no more new songs to load,
      //and you can't continue in the playlist.
      that.setIndex( newIdx > that.length ? null : newIdx );
    });

    return deferred;
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
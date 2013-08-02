App.Collections.Songs = Backbone.Collection.extend({

  model: App.Models.Song,

  comparator: function(songA, songB){
    if (songA.get("first_published_at") > songB.get("first_published_at")) return -1;
    if (songA.get("first_published_at") < songB.get("first_published_at")) return 1;
    return 0;
  },

  initialize: function(models, options){
    var options = options || {};

    this.url = "/songs";
    this.feedId = options.feedId || null;
    this.page = Math.floor(this.length/App.SONGS_PER_PAGE);
    this.loadMore = true;
    this.currentIdx = 0;

    //If you start off with very few items from this feed, and then
    //click the feed page, we'll need to get some more.
    if (this.feedId && this.length < 10) this.loadNextPage();
  },

  loadNextPage: function() {
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
            that.add(data);
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
    this.trigger("changeIndex");
  }

});
App.Collections.Songs = Backbone.Collection.extend({

  model: App.Models.Song,

  comparator: function(songA, songB){
    if (songA.get("first_published_at") > songB.get("first_published_at")) return -1;
    if (songA.get("first_published_at") < songB.get("first_published_at")) return 1;
    return 0;
  },

  initialize: function(models, options){
    this.url = "/songs";
    this.page = 1;
    this.loadMore = true;
  },

  loadNextPage: function() {
    if (this.loadMore) {
      var that = this;
      this.loadMore = false;

      return $.ajax({
        url: this.url,
        type: 'GET',
        data: {page: this.page+1},
        success: function(data) {
          if(data.length > 0) {
            that.add(data, {scrollToPreviousPosition: true});
            that.loadMore = true;
            that.page++;
          }
        },
        error: function() {
          //TODO: Handle error
        }
      });
    }
  }

});
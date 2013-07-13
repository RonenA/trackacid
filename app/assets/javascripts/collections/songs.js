App.Collections.Songs = Backbone.Collection.extend({
  model: App.Models.Song,
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
  }

});
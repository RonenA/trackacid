App.Collections.Feeds = Backbone.Collection.extend({

  model: App.Models.Feed,
  url: "/feeds",

  comparator: function(feed) {
    return feed.get('title');
  }

});

App.Routers.Main = Backbone.Router.extend({

  routes: {
    ""         : "songIndex",
    "feeds"    : "feedIndex",
    "feeds/:id": "feedShow"
  },

  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  feedIndex: function() {
    App.feeds.fetch();

    var view = new App.Views.FeedIndex({collection: App.feeds});
    this.$rootEl.html( view.render().$el );
  },

  feedShow: function(id) {
    var feed = App.feeds.get(id);

    if (!feed){
      feed = new App.Models.Feed({ id: id }, { parse: true });
      App.feeds.add(feed);
    }

    feed.fetch();

    var view = new App.Views.FeedShow({ model: feed });
    this.$rootEl.html( view.render().$el );
  },

  songIndex: function() {
    App.songs.fetch();

    var view = new App.Views.SongIndex({collection: App.songs});
    this.$rootEl.html( view.render().$el );
  }

});

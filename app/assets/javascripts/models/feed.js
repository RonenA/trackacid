App.Models.Feed = Backbone.Model.extend({
  parse: function(resp) {
    var songData = resp.songs || [];
    resp.songs = new App.Collections.Songs(songData, {feed: this});
    return resp;
  },

  toJSON: function() {
    var attrs = _.clone(this.attributes);
    if (attrs.songs) attrs.songs = attrs.songs.toJSON();
    return attrs;
  },

  changeUnheardCount: function(delta) {
    var currentCount = this.get('unheard_count');
    this.set('unheard_count', currentCount + delta);
  }
});

App.Models.Feed.follow = function(feed_id, options) {
  options = options || {};

  App.feeds.create({feed_id: feed_id}, {
    success: function() {
      if (options.success) options.success();
      if (options.complete) options.complete();
    },
    error: function(model, xhr, options) {
      App.Alerts.new("error", "Feed could not be added due to: " + xhr.statusText);
      if (options.error) options.error();
      if (options.complete) options.complete();
    },
    wait: true
  });
};
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

App.Collections.Entries = Backbone.Collection.extend({
  model: App.Models.Entry,
  initialize: function(models, options){
    this.url = "feed/" + options.feed.id + "/entries";
  }
});
App.Collections.Songs = Backbone.Collection.extend({
  model: App.Models.Song,
  initialize: function(models, options){
    this.url = "/songs";
  }

});
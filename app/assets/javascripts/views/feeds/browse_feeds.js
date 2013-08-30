App.Views.BrowseFeeds = Backbone.View.extend({

  template: HandlebarsTemplates['feeds/browse'],

  events: {

  },

  initalize: function() {
  },

  render: function() {
    var content = this.template({feeds: this.collection});
    this.$el.html(content);
    return this;
  }


});
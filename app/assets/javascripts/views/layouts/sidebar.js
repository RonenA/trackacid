App.Views.Sidebar = Backbone.View.extend({

  className: 'l-sidebar',
  template: HandlebarsTemplates['layouts/sidebar'],

  render: function(){
    var content = this.template({currentUser: App.currentUser});
    this.$el.html(content);
    var feedView = new App.Views.FeedIndex({collection: App.feeds});
    this.$el.find('#t--feeds').replaceWith( feedView.render().$el );

    return this;
  }

});
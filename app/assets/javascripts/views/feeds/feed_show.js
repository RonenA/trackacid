App.Views.FeedShow = Backbone.View.extend({

  template: HandlebarsTemplates['feeds/show'],

  events: {
    'click .refresh':'refresh'
  },

  initialize: function(){
    this.listenTo( this.model, "change sync", this.render);
  },

  render: function(){
    var content = this.template({ feed: this.model.toJSON() });

    this.$el.html(content);
    return this;
  },

  refresh: function(){
    this.model.fetch();
  }

});
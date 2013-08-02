App.Views.FeedIndex = Backbone.View.extend({

  template: HandlebarsTemplates['feeds/index'],

  events: {
    'submit .new-feed-form' : 'addFeed'
  },

  initialize: function(){
    this.listenTo( this.collection, "change add remove sync", this.render );
  },

  render: function(){
    var content = this.template({ feeds: this.collection.toJSON() });
    this.$el.html(content);
    return this;
  },

  addFeed: function(e){
    e.preventDefault();
    var target = $(e.currentTarget);
    var url = target.find('[name=url]').val();

    App.feeds.create({url: url}, {
      success: function(){
        App.songs.fetch();
      }
    });
  }


});
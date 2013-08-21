App.Views.FeedIndex = Backbone.View.extend({

  tagName: 'ul',
  className: 'l-sidebar__body sidebar__list feed-list',
  template: HandlebarsTemplates['feeds/index'],

  events: {
    'submit .new-feed-form' : 'addFeed'
  },

  initialize: function(){
    this.listenTo( this.collection, "change add remove sync reset", this.render );
  },

  render: function(){
    var data = this.collection.toJSON();
    _(data).each(function(feed){
      if (feed.unheard_count === 0) {
        feed.unheard_count = "";
      }
    });
    var content = this.template({ feeds: data});
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
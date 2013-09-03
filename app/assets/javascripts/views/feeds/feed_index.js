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

    var selectedFeedId = this.options.mainCollection ? this.options.mainCollection.feedId : null;

    var result = this.template({
      feeds:          data,
      selectedFeedId: selectedFeedId
    });

    var oldScrollPosition = this.$el.scrollTop();
    this.$el.html(result);
    this.$el.scrollTop(oldScrollPosition);

    return this;
  }

});
App.Views.FeedIndex = Backbone.View.extend({

  tagName: 'ul',
  className: 'l-sidebar__body sidebar__list feed-list',
  template: HandlebarsTemplates['feeds/index'],

  events: {
    'submit .new-feed-form' : 'addFeed'
  },

  initialize: function(){
    this.listenTo( this.collection, "change add remove sync reset", this.render );
    this.listenTo(this.collection, "add remove", function(){
      App.songs.resetAndSeed();
    });
  },

  render: function(){
    var feeds = this.collection.toJSON();
        selectedFeedId = this.options.mainCollection ?
            this.options.mainCollection.feedId : null,
        totalUnheardCount =  feeds.reduce(function(memo, feed) {
                                return memo + feed.unheard_count;
                              }, 0),
        context = {
          feeds: feeds,
          totalUnheardCount: totalUnheardCount,
          selectedFeedId: selectedFeedId
        },
        oldScrollPosition = this.$el.scrollTop();

    this.$el.html( this.template(context) );
    this.$el.scrollTop(oldScrollPosition);

    return this;
  },

  changeCollection: function(newCollection) {
    this.options.mainCollection = newCollection;
    this.render();
  }

});
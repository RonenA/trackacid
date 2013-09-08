App.Views.BrowseFeeds = Backbone.View.extend({

  events: {
    'click .js-unsubscribe-feed': 'unsubscribeFeed',
    'click .js-subscribe-feed':   'subscribeFeed',
  },

  initialize: function() {
    this.listenTo(App.feeds, "destroy add", this.renderList);
    this.listenTo(this.collection, "change:loading", this.renderList);

    this.$listEl = $('<ul>').addClass('browse-feeds-list l-main__list');
    this.$headerEl = $('<div>').addClass('header');
    this.$el.prepend( this.$listEl );
    this.$el.prepend( this.$headerEl );
  },

  render: function() {
    this.renderList();
    this.renderHeader();
    return this;
  },

  renderList: function() {
    var result = HandlebarsTemplates['feeds/browse/list']({ feeds: this.collection.toJSON() });
    var oldScrollPosition = this.$listEl.scrollTop();
    this.$listEl.html(result);
    this.$listEl.scrollTop(oldScrollPosition);

  },

  renderHeader: function() {
    var result = HandlebarsTemplates['feeds/browse/header']();
    this.$headerEl.html(result);
  },

  //Using id from target instead of model from target
  //because this.collection is ALL the feeds, and the model
  //we want may be the model in App.feeds
  _idFromTarget: function(target) {
    return target.closest('.browse-feeds-list > li').data('id');
  },

  unsubscribeFeed: function(e) {
    var target = $(e.currentTarget);
    var id = this._idFromTarget(target);
    var model = App.feeds.get(id);
    model.destroy();
  },

  subscribeFeed: function(e) {
    var that = this;
    var target = $(e.currentTarget);
    var id = this._idFromTarget(target);

    var feed = this.collection.get(id);
    feed.set('loading', true);

    App.Models.Feed.follow(id, {
      complete: function(){
        feed.set('loading', false);
      }
    });
  }


});
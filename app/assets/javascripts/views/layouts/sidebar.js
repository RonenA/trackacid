App.Views.Sidebar = Backbone.View.extend({

  className: 'l-sidebar',
  template: HandlebarsTemplates['layouts/sidebar'],

  events: {
    'typeahead:selected .js-add-feed': 'addFeed'
  },

  initialize: function() {
    this.listenTo(App.feeds, 'add change', this.render);
  },

  render: function(){
    var content = this.template();
    this.$el.html(content);
    var feedView = new App.Views.FeedIndex({collection: App.feeds});
    this.$el.find('#t--feeds').replaceWith( feedView.render().$el );

    return this;
  },

  initializeTypeahead: function() {
    $('.js-add-feed').typeahead({
      name: 'feeds',
      valueKey: 'title',
      prefetch: {
        url: "/feeds?all=true",
        filter: this._parseForTypeahead
      },
      template: '<p>{{title}}</p>',
      engine: Hogan
    });
  },

  _parseForTypeahead: function(data) {
    _(data).each(function(feed){
      feed.tokens = feed.title.split(" ");
    });

    return data;
  },

  addFeed: function(event, datum) {
    if(App.feeds.get(datum.id) === undefined){
      App.feeds.create({feed_id: datum.id}, {
        success: function(){
          App.songs.resetAndSeed();
        }
      });
    } else {
      $('.js-add-feed').typeahead('setQuery', "");
    }
  }

});
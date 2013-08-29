App.Views.Sidebar = Backbone.View.extend({

  template: HandlebarsTemplates['layouts/sidebar'],

  events: {
    'typeahead:selected .js-add-feed': 'addFeed',
  },

  initialize: function(options) {
    this.mainCollection = options.mainCollection;
  },

  render: function(){
    var content = this.template();
    this.$el.html(content);
    var feedView = new App.Views.FeedIndex({collection: App.feeds,
                                            mainCollection: this.mainCollection});
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
      template: '{{title}}',
      engine: Hogan,
      header: "<h3 class='tt-suggestion-heading'>Search Results</h3>"
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
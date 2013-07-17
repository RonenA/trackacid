App.Routers.Main = Backbone.Router.extend({

  routes: {
    ""         : "root"
  },

  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  root: function() {
    var main = new App.Views.SongIndex({collection: App.songs});
    this.$rootEl.html( main.render().$el );

    var sidebar = new App.Views.Sidebar();
    this.$rootEl.prepend( sidebar.render().$el );

    this.setRootElHeight();
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    this.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

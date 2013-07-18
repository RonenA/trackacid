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

    //TODOL: Augh. You can't use scroll in the backbone events object because
    //scroll doesn't bubble, and we need the element to be on the page in order
    //to bind to it so we have to do this here. There must be a better way.
    $('.js-song-list-scroll').scroll(main.infiniteScrollHandler.bind(main));
  },

  setRootElHeight: function(){
    var windowHeight = $(window).height();
    var outOfRootHeight = $('.l-out-of-root').outerHeight();
    this.$rootEl.height(windowHeight - outOfRootHeight);
  },

});

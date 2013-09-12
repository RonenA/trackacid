App.Views.Sidebar = Backbone.View.extend({

  template: function() {
    return App.currentUser ?
            HandlebarsTemplates['layouts/sidebar']() :
            HandlebarsTemplates['layouts/sidebar--homepage']()
  },

  events: {
    'submit .js-new-user' : 'newUser'
  },

  remove: function() {
    if (this.feedView) this.feedView.remove();
    this.$el.remove();
    this.stopListening();
    return this;
  },

  render: function() {
    var that = this;
    var content = this.template();
    this.$el.html(content);

    if (App.currentUser) this.renderFeedList();

    window.setTimeout(function(){
      that.hideScrollbar();
      that.$el.find('input, textarea').placeholder();
    });

    return this;
  },

  renderFeedList: function() {
    this.feedView = new App.Views.FeedIndex({
      collection:     App.feeds,
      mainCollection: this.options.mainCollection
    });

    this.$el.find('#t--feeds').replaceWith( this.feedView.render().$el );
  },

  changeMainCollection: function(collection) {
    if (this.feedView) {
      this.feedView.changeCollection(collection);
    } else {
      this.options.mainCollection = collection;
      this.render();
    }
  },

  newUser: function(e) {
    e.preventDefault();
    var form = $(e.currentTarget);
    if (form.hasClass('is-loading')) return;
    var userData = form.serializeJSON();

    $.ajax({
      url: '/users',
      dataType: 'json',
      type: 'post',
      data: userData,
      beforeSend: function() {
        form.addClass('is-loading');
      },
      success: function(data, textStatus, jqXHR) {
        ga('send', 'event', 'users', 'signup', 'homepage', data.email);

        App.currentUser = data;
        App.feeds = new App.Collections.Feeds();
        App.songs.reset();
        App.router.root();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        var errors = jqXHR.responseJSON.errors;
        var result = HandlebarsTemplates['layouts/error_list']({errors: errors});
        var $errorEl = form.find('.js-errors').html( result );
      },
      complete: function() {
        form.removeClass('is-loading');
      }
    })
  },

  hideScrollbar: function() {
    var sidebarBody = $('.l-sidebar__body');

    if(sidebarBody.length) {
      var clientWidth = sidebarBody[0].clientWidth;
      var fullWidth = $('.l-sidebar').width();

      sidebarBody.css('right', clientWidth - fullWidth);
    }
  }

});
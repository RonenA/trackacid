App.Views.Sidebar = Backbone.View.extend({

  template: function() {
    return App.currentUser ?
            HandlebarsTemplates['layouts/sidebar']() :
            HandlebarsTemplates['layouts/sidebar--homepage']()
  },

  events: {
    'submit .js-new-user' : 'newUser'
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);

    if (App.currentUser) {
      var feedView = new App.Views.FeedIndex({
        collection:     App.feeds,
        mainCollection: this.options.mainCollection
      });
      this.$el.find('#t--feeds').replaceWith( feedView.render().$el );
    }

    return this;
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
        App.currentUser = data;
        App.feeds = new App.Collections.Feeds();
        App.songs.reset();
        App.router.root();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        var errors = jqXHR.responseJSON;
        var result = HandlebarsTemplates['layouts/error_list']({errors: errors});
        var $errorEl = form.find('.js-errors').html( result );
      },
      complete: function() {
        form.removeClass('is-loading');
      }
    })
  }

});
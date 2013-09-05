App.Alerts = {
  icons: {
    notice: "info",
    error: "error"
  },

  initalize: function() {
    var that = this;
    this.$el = $('.alerts');
    this.bindEvents();
    this.renderBootstrappedAlerts();
  },

  bindEvents: function() {
    this.$el.on('click', '.js-close-alert', function(e){
      $(this).closest('.alerts > li').remove();
    });
  },

  renderBootstrappedAlerts: function() {
    var that = this;
    var existingAlerts = JSON.parse( $('#alerts-json').html() );
    _(existingAlerts).each(function(value, key) {
      if (value !== null && value !== "") that.new(key, value);
    });
  },

  new: function(kind, message) {
    var context = {
      message: message,
      kind: kind,
      icon: this.icons[kind]
    };

    var alert = HandlebarsTemplates['layouts/alert'](context);
    this.$el.append(alert);
  },
};
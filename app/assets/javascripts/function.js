Function.prototype.passToObject = function(methods) {
  var that = this;
  _(methods).each(function(oldMethod, newMethod) {
    that.prototype[newMethod] = function() {
      return this.object[oldMethod].apply(this.object, arguments);
    };
  });
};
$.Deferred = (function() {
  var oldDeferred = $.Deferred;

  return function() {
    var deferred = oldDeferred.apply($, arguments);

    deferred.become = function(source) {
      source.done(function(source) {
        deferred.resolve(source);
      });
    };

    return deferred;
  };
})();
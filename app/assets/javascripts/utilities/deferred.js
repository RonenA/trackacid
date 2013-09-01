$.Deferred.now = function() {
  return $.Deferred().resolve();
};
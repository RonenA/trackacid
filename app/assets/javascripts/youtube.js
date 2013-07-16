App.YouTubeReady = new $.Deferred();

function onYouTubeIframeAPIReady(){
  App.YouTubeReady.resolve();
};
//YouTube
App.YouTubeReady = new $.Deferred();

function onYouTubeIframeAPIReady(){
  App.YouTubeReady.resolve();
};

//SoundCloud
App.SoundCloudReady = new $.Deferred();

$.ajax({
  url: 'http://connect.soundcloud.com/sdk.js',
  dataType: "script",
  success: function() {
    SC.initialize({ client_id: API_KEYS.SoundCloud });
    App.SoundCloudReady.resolve();
  }
});
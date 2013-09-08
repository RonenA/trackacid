//YouTube
App.YouTubeReady = new $.Deferred();

$.getScript('https://www.youtube.com/iframe_api');

$.ajax({
  url: 'https://www.youtube.com/iframe_api',
  dataType: "script",
  //cache: true,
  //No success function needed, it will call the
  //next fuction on its own when its done.
  error: function() {
    App.Alerts.new("error", "Could not connect to YouTube");
  }
});

function onYouTubeIframeAPIReady(){
  App.YouTubeReady.resolve();
};


//SoundCloud
App.SoundCloudReady = new $.Deferred();

$.ajax({
  url: 'http://connect.soundcloud.com/sdk.js',
  dataType: "script",
  //cache: true, //not sure if this stuff should be cached
  success: function() {
    SC.initialize({ client_id: API_KEYS.SoundCloud });
    App.SoundCloudReady.resolve();
  },
  error: function() {
    App.Alerts.new("error", "Could not connect to SoundCloud");
  }
});
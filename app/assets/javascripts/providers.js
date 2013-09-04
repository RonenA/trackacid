//YouTube
App.YouTubeReady = new $.Deferred();

function onYouTubeIframeAPIReady(){
  App.YouTubeReady.resolve();
};

//SoundCloud
App.SoundCloudReady = new $.Deferred();

$.getScript('http://connect.soundcloud.com/sdk.js', function() {
    SC.initialize({ client_id: API_KEYS.SoundCloud });
    App.SoundCloudReady.resolve();
});
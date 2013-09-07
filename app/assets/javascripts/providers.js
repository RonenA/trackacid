//YouTube
App.YouTubeReady = new $.Deferred();

$.getScript('https://www.youtube.com/iframe_api');

//No success function needed, it will call the
//next fuction on its own when its done.
function onYouTubeIframeAPIReady(){
  App.YouTubeReady.resolve();
};


//SoundCloud
App.SoundCloudReady = new $.Deferred();

$.getScript('http://connect.soundcloud.com/sdk.js', function() {
    SC.initialize({ client_id: API_KEYS.SoundCloud });
    App.SoundCloudReady.resolve();
});
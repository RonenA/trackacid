App.Models.Song = Backbone.Model.extend({

  initialize: function() {
    this.listenTo(this, 'change:listened', this.changeListenedHandler);
    this.listenTo(this, 'destroy', this.destroyHandler);

    var sortedEntries = _(this.get('entries')).sortBy(function(entry) {
      return new Date(entry.published_at);
    });

    this.set('entries', sortedEntries, {silent: true});
  },

  toJSON: function(options) {
    var json = _.clone(this.attributes);
    json.ownedByUser = this.ownedByUser();
    return json;
  },

  url: function() {
    return '/songs/'+this.id;
  },

  firstPublishedForFeed: function(feedId){
    if (!isNaN(feedId)) {
      return _(this.get('entries')).findWhere({feed_id: feedId}).published_at;
    } else {
      return this.get('first_published_at');
    }
  },

  dataFromProvider: function() {
    // Currently, this is only used when a soundcloud song
    // is actaully a playlist and we need to get the most
    // popular song from that playlist.
    var that = this;
    this._dataFromProvider = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {
      App.SoundCloudReady.done(function() {
        SC.get( that.get('api_url'),
          function(response, error) {
            if (error) {
              App.Alerts.new("error", "Could not load " + that.get('title') + " due to '" + error.message + "'.");
              that.skip(); //skip this song then
            } else {
              that._dataFromProvider.resolve(response);
            }
          }
        );
      });
    } else if (this.get('provider') === "YouTube") {
      this._dataFromProvider.resolve({});
    }

    return this._dataFromProvider;
  },

  startLoadingSound: function(options) {
    //TODO: Handle errors here
    var that = this;
    var sound = new $.Deferred();

    if(this.get('provider') === "SoundCloud") {

      var id = new $.Deferred();

      if(this.get('kind') === "playlist") {
        this.dataFromProvider().done(function(data) {
          //Use the most popular track if it is a playlist
          var bestTrackId = _(data.tracks).sortBy(function(track) {
            return track.favoritings_count;
          }).reverse()[0].id;

          id.resolve(bestTrackId);
        });
      } else if (this.get('kind') === "track") {
        id.resolve(that.get('id_from_provider'));
      }

      id.done(function(id){
        var stream_url = "/tracks/"+id;
        if (that.get('secret_token')) {
          stream_url = stream_url+"?secret_token="+that.get('secret_token');
        }

        App.SoundCloudReady.done(function() {
          SC.stream(stream_url,
            {
              onplay: options.onplay,
              onpause: options.onpause,
              onfinish: options.onfinish,
              onbufferchange: function() {
                if (this.isBuffering) {
                  options.onstartbuffering();
                } else {
                  options.onendbuffering();
                }
              },
              onload: function(success) {
                // readyState of 2 means 'failed/error'

                // According to the SoundManager docs for onload,
                // flash sometimes reports failure when it was just
                // cached, so I'm being paranoid and checking if
                // the position is null before declaring an error.
                if(this.readyState === 2 && this.position === null) {
                  that.skip();
                  App.Alerts.new('error', 'Could not load "'+that.get('title')+'". Try listening directly on SoundCloud.');
                }
              }
            },
            function(response){
              sound.resolve(new App.Models.SoundCloudSound(response));
            }
          );
        });
      });

    } else if (this.get('provider') === "YouTube") {
      App.YouTubeReady.done(function(){
        //setTimeout so that this doesn't try to happen
        //before #youtube-video is rendered.
        window.setTimeout(function(){
          new YT.Player('youtube-video', {
            height: '200',
            width: '200',
            videoId: that.get('id_from_provider'),
            playerVars: {
              controls: 0,
              showinfo: 0,
              origin: document.location.origin
            },
            events: {
              'onReady': function(e) {
                sound.resolve(new App.Models.YouTubeSound(e.target));
              },
              'onStateChange': function(e) {
                if (e.data === YT.PlayerState.PLAYING ||
                    e.data === YT.PlayerState.BUFFERING) {
                  options.onplay();
                }

                if (e.data === YT.PlayerState.PAUSED) {
                  options.onpause();
                }

                if (e.data === YT.PlayerState.ENDED) {
                  options.onfinish();
                }
              },
              'onError': function(resp) {
                var reason;

                switch(resp.data) {
                case 2:
                  reason = "of invalid parameter value";
                  break;
                case 100:
                  reason = "video could not be found";
                  break;
                case 101:
                  reason = "owner has disabled video embedding";
                  break;
                case 150:
                  reason = "owner has disabled video embedding";
                  break;
                default:
                  //Disabled as it seems to do this randomly
                  //reason = "of an unknown error";
                }

                if(reason) {
                  App.Alerts.new("error", that.get('title') + " could not be loaded because " + reason);
                  that.skip();
                }
              }
            }
          });
        });

      });
    }

    sound.done(this.recordListen.bind(this));

    return sound;
  },

  recordListen: function() {
    this.setAndPersist("listened", true);
  },

  removeListen: function() {
    this.setAndPersist("listened", false);
  },

  recordFavorite: function() {
    this.setAndPersist("favorited", true);
  },

  removeFavorite: function() {
    this.setAndPersist("favorited", false);
  },

  setAndPersist: function(attribute, value) {
    if (this.get(attribute) !== value && App.currentUser && this.ownedByUser()) {
      this.set(attribute, value);

      $.ajax({
        type: (value ? "POST" : "DELETE"),
        url: this.url()+"/"+App.Models.Song.attributeToResource[attribute],
        error: function(jqXHR, textStatus, errorThrown) {
          App.Alerts.new("error", "Song " + attribute + " state could not be updated due to: " + errorThrown);
        }
      });
    }
  },

  changeListenedHandler: function(model, value, options) {
    this.updateFeedUnheardCount(value ? -1 : 1);
  },

  destroyHandler: function(model, collection, options) {
    this.updateFeedUnheardCount(-1);
  },

  updateFeedUnheardCount: function(delta) {
    var entries = this.get('entries');
    var feeds = _(entries).map(function(entry) {
      return App.feeds.get(entry.feed_id);
    });

    feeds = _.uniq(feeds);

    _(feeds).each(function(feed) {
      feed.changeUnheardCount(delta);
    });
  },

  skip: function() {
    this.collection.incrementIndex(1);
  },

  hasOwnSpinner: function() {
    return App.Models.Song.providerInfo[this.get("provider")].hasOwnSpinner;
  },

  ownedByUser: function() {
    if (!App.currentUser) return false;
    return _(this.get('entries')).any(function(entry) {
      return App.feeds.get(entry.feed_id);
    });
  },

});

App.Models.Song.providerInfo = {
  SoundCloud: {
    hasOwnSpinner: false
  },
  YouTube: {
    hasOwnSpinner: true
  }
};

App.Models.Song.attributeToResource = {
  listened: "listen",
  favorited: "favorite"
}
require 'addressable/uri'

class Song < ActiveRecord::Base
  attr_accessible :provider, :source_url

  before_validation :set_first_published_at, :on => :create
  before_validation :set_data_from_provider, :on => :create

  validates_presence_of :provider, :source_url, :first_published_at,
    :id_from_provider, :public_link, :title, :kind

  validates_uniqueness_of :id_from_provider, :scope => [:provider]

  has_many :user_songs, :dependent => :destroy
  has_many :entry_songs, :dependent => :destroy
  has_many :entries, :through => :entry_songs

  @@PROVIDERS = {
    :SoundCloud => {
      :queries => [
        [:iframe, :src, "[src*='soundcloud.com/player']"],
        [:link, :href, "[href*='soundcloud.com']"]
      ]
    },
    :YouTube => {
      :queries => [
        [:iframe, :src, "[src*='youtube.com/embed']"]
      ]
    }
  }

  def self.PROVIDERS
    @@PROVIDERS
  end

  def self.parse_iframe_src(src, provider)
    if provider == :SoundCloud
      CGI::parse( URI.parse(src).query )["url"].first
    elsif provider == :YouTube
      src
    end
  end

  # This will most likely be overridden to an earlier date
  # when the Song is associated with an Entry, but if for some
  # reason that doesn't happen, such as if someone has an
  # improperly formatted RSS feed with no published dates,
  # at least the song's date will not be nil.
  def set_first_published_at
    self.first_published_at = Time.now
  end

  def set_data_from_provider
    send("set_data_from_#{provider.downcase}")
  end

  def set_data_from_soundcloud
    begin
      client = Soundcloud.new(:client_id => API_KEYS[:SoundCloud])
      track = client.get('/resolve', :url => source_url)

      return false if track.nil? ||
                     !track.streamable ||
                     !["track", "playlist"].include?(track.kind)

      self.kind               = track.kind
      self.id_from_provider   = track.id
      self.public_link        = track.permalink_url
      self.title              = track.title
      self.user_from_provider = track.user.username
      self.description        = track.description
      self.duration           = track.duration
      self.artwork_url        = track.artwork_url
      self.download_url       = track.download_url if track.downloadable
    rescue => e
      p e.message
      return false
    end
  end

  def set_data_from_youtube
    begin
      params = {:part => "snippet, contentDetails, status",
                :id   => source_url.match(/\/embed\/([^\?\/]*)/)[1],
                :key  => API_KEYS[:YouTube]}
      resp = RestClient.get("https://www.googleapis.com/youtube/v3/videos", :params => params)
      data = JSON.parse(resp)["items"][0]

      return false if data.nil? || !data["status"]["embeddable"]

      self.id_from_provider   = data["id"]
      self.public_link        = "http://www.youtube.com/watch?v=#{data["id"]}"
      self.title              = data["snippet"]["title"]
      self.user_from_provider = data["snippet"]["channelTitle"]
      self.description        = data["snippet"]["description"]
      self.duration           = ISO8601::Duration.new(data["contentDetails"]["duration"]).to_seconds * 1000
      self.artwork_url        = data["snippet"]["thumbnails"]["medium"]["url"]
      self.kind               = data["kind"].match(/youtube#(.*)/)[1]
    rescue => e
      p e.message
      return false
    end
  end

end


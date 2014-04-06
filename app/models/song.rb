require 'addressable/uri'

class Song < ActiveRecord::Base
  attr_accessible :provider, :source_url, :secret_token

  before_validation :set_first_published_at, :on => :create
  #before_validation :set_data_from_provider, :on => :create

  validates_presence_of :provider, :source_url, :first_published_at,
    :id_from_provider, :public_link, :title, :kind

  validates_uniqueness_of :id_from_provider, :scope => [:provider]

  has_many :user_songs, :dependent => :destroy
  has_many :entry_songs, :dependent => :destroy
  has_many :entries, :through => :entry_songs

  paginates_per UserSong.SONGS_PER_PAGE

  default_scope order('first_published_at DESC')

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

  @@SAFE_SOURCE_URL_PARAMS = [:secret_token]

  def self.PROVIDERS
    @@PROVIDERS
  end

  def self.parse_iframe_src(src, provider)
    if provider == :SoundCloud
      uri_object = Addressable::URI.parse(src)
      uri_object.query_values["url"]
    elsif provider == :YouTube
      src
    end
  end

  def self.clean_source_url(url)
    uri_object = Addressable::URI.parse(url)
    params = uri_object.query_values || {}
    safe_params = params.select do |key, val|
      @@SAFE_SOURCE_URL_PARAMS.include?(key.to_sym)
    end
    #Set to nil instead of {} to avoid trailing '?' in the url
    uri_object.query_values = safe_params.empty? ? nil : safe_params
    uri_object.to_s
  end

  def self.find_or_create_from_hash(attrs)
    attrs[:source_url] = Song.clean_source_url(attrs[:source_url])
    song = Song.find_or_initialize_by_source_url(attrs[:source_url])
    if not song.persisted?
      song.update_attributes(attrs)
      song.set_data_from_provider
      begin
        song.save!
      rescue => e
        if song.id_from_provider && e.message == "Validation failed: Id from provider has already been taken"
          return Song.find_by_id_from_provider_and_provider(song.id_from_provider.to_s, song.provider)
        else
          puts "Could not save #{song.source_url} due to #{e.message}"
        end
      end
    end
    song.persisted? ? song : nil #Check again in case the song didn't save properly
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
      set_secret_token(source_url)
      client = Soundcloud.new(:client_id => API_KEYS[:SoundCloud])
      track = client.get('/resolve', :url => source_url)

      return false if track.nil? ||
                     !track.streamable ||
                     !["track", "playlist"].include?(track.kind)

      self.kind               = track.kind
      self.id_from_provider   = track.id
      self.public_link        = track.permalink_url
      self.api_url            = track.uri
      self.title              = track.title
      self.user_from_provider = track.user.username
      self.description        = track.description
      self.duration           = track.duration
      self.artwork_url        = track.artwork_url
      self.waveform_url       = track.waveform_url
      self.download_url       = track.download_url if track.downloadable

      # If the source_url is from an href, not an iframe
      # then the first set_secret_token wouldn't find one.
      set_secret_token(api_url) unless secret_token
    rescue => e
      puts "Could not set data from SoundCloud on #{self.source_url} due to #{e.message}"
      return false
    end
  end

  def set_secret_token(url)
    uri_object = Addressable::URI.parse(url)
    params = uri_object.query_values || {}
    self.secret_token = params['secret_token']
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
      puts "Could not set data from youtube on #{self.source_url} due to #{e.message}"
      return false
    end
  end

  def as_json(options = {})
    options[:except] ||= []
    options[:except] += [:created_at, :updated_at]
    #TODO: Why do I have to do this manually, why doesn't the as_json handle it?
    options[:include] ||= {:entries => { :except => :content_encoded }}

    super(options)
  end

end


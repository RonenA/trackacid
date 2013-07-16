class Song < ActiveRecord::Base
  attr_accessible :provider, :url

  validates_presence_of :provider, :url, :first_published_at

  has_many :entry_songs
  has_many :entries, :through => :entry_songs

  before_validation :set_first_published_at

  @@PROVIDERS = {
    :SoundCloud => {
      :url => "soundcloud.com/player"
    },
    :YouTube => {
      :url => "youtube.com/embed"
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

  #This will most likely to overridden to an earlier date
  #when the Song associated with an Entry, but if for some
  #reason that doesn't happen, such as if someone has an
  #improperly formatted RSS feed with no published dates,
  #at least the song's date will not be nil.
  def set_first_published_at
    self.first_published_at = Time.now
  end

end


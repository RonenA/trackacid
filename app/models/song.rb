class Song < ActiveRecord::Base
  attr_accessible :provider, :url

  has_many :entry_songs
  has_many :entries, :through => :entry_songs

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
end


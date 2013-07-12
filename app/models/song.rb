class Song < ActiveRecord::Base
  attr_accessible :provider, :url

  belongs_to :entry

  @@PROVIDERS = {
    :soundcloud => {
      :url => "soundcloud.com/player"
    },
    :youtube => {
      :url => "youtube.com/embed"
    }
  }

  def self.PROVIDERS
    @@PROVIDERS
  end

  def self.parse_iframe_src(src, provider)
    if provider == :soundcloud
      CGI::parse( URI.parse(src).query )["url"].first
    elsif provider == :youtube
      src
    end
  end
end


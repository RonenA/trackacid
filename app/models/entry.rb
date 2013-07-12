require 'cgi'

class Entry < ActiveRecord::Base
  attr_accessible :guid, :link, :published_at, :title, :feed_id, :content_encoded

  belongs_to :feed
  has_many :entry_songs
  has_many :songs, :through => :entry_songs

  after_create :find_songs

  def self.create_from_json!(entryData, feed)
    Entry.create!({
      guid: entryData.guid,
      link: entryData.link,
      published_at: entryData.pubDate,
      title: entryData.title,
      content_encoded: CGI.unescapeHTML(entryData.content_encoded || entryData.description),
      feed_id: feed.id
    })
  end

  def find_songs
    rss_dom = Nokogiri::HTML(self.content_encoded)

    #Unless you could find songs in the RSS content
    unless Song.PROVIDERS.keys.any? do |provider|
      find_and_create_provider_songs(rss_dom, provider)
    end
      #Look in the entry content
      entry_dom = Nokogiri::HTML( open(self.link, &:read) )
      Song.PROVIDERS.keys.any? do |provider|
        find_and_create_provider_songs(entry_dom, provider)
      end
    else
      true
    end
  end

  def find_and_create_provider_songs(dom, provider)
    provider_url = Song.PROVIDERS[provider][:url]
    song_nokos = dom.css("[src*='#{provider_url}']")
    song_nokos.each do |song_noko|
      src = song_noko.get_attribute(:src)
      url = Song.parse_iframe_src(src, provider)
      song = Song.find_or_create_by_url_and_provider(url, provider)
      self.songs << song
    end
    song_nokos.any?
  end

end

require 'cgi'

class Entry < ActiveRecord::Base
  attr_accessible :guid, :link, :published_at, :title, :feed_id, :content_encoded

  belongs_to :feed
  has_many :entry_songs
  has_many :songs, :through => :entry_songs

  after_create :find_songs

  #TODO: Do we even need to store the content_encoded?
  #We just need to rip the song urls.
  def self.create_from_json!(entryData, feed)
    Entry.create!({
      guid:            entryData.guid,
      link:            entryData.link,
      published_at:    entryData.pubDate,
      title:           entryData.title,
      content_encoded: CGI.unescapeHTML(entryData.content_encoded || entryData.description),
      feed_id:         feed.id
    })
  end

  def find_songs
    rss_dom = Nokogiri::HTML(self.content_encoded)

    #TODO: Logic here is very confusing

    #Unless you could find some songs in the RSS content...
    unless Song.PROVIDERS.keys.any? do |provider|
      find_and_create_provider_songs(rss_dom, provider)
    end
      #...look in the entry content
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
      source_url = Song.parse_iframe_src(src, provider)
      song = Song.find_or_initialize_by_source_url_and_provider(source_url, provider)
      self.songs << song if song.persisted? || song.save
    end
    song_nokos.any?
  end

end

require 'cgi'
require 'addressable/uri'

class Entry < ActiveRecord::Base
  attr_accessible :guid, :link, :published_at, :title, :feed_id, :content_encoded

  belongs_to :feed
  has_many :entry_songs, :dependent => :destroy
  has_many :songs, :through => :entry_songs

  after_create :find_songs

  #default_scope order('published_at DESC')

  #TODO: Do we even need to store the content_encoded?
  #We just need to rip the song urls.
  def self.create_from_json!(entry_data, feed)
    #I want to see the errors in dev
    method = (Rails.env == "development") ? "create!" : "create"

    begin
      Entry.send(method, {
        guid:            entry_data.guid || entry_data.id || entry_data.link,
        link:            CGI.unescapeHTML(entry_data.link || ""),  #Requires || "" because unescapeHTML
        published_at:    entry_data.pubDate || entry_data.modified, #only a nil throws an error.
        title:           CGI.unescapeHTML(entry_data.title || ""),
        content_encoded: CGI.unescapeHTML(entry_data.content_encoded || entry_data.content|| entry_data.description || ""),
        feed_id:         feed.id
      })
    rescue ActiveRecord::RecordNotUnique
      puts "Entry already exists"
    end
  end

  def find_songs
    rss_dom = Nokogiri::HTML(self.content_encoded)
    if find_and_create_songs(rss_dom)
      true
    else
      begin
        entry_dom = Nokogiri::HTML( open(self.link, &:read) )
      rescue URI::InvalidURIError
        p "#{self.link} is invalid"
      end

      #If the site changes its html structure and the selector
      #no longer finds anything, fallback to body

      #TODO: Requires repetative query for feed during reload process
      if entry_dom.css(feed.content_selector).empty?
        content_selector = "body"
      else
        content_selector = feed.content_selector
      end
      find_and_create_songs( entry_dom.css(content_selector) )
    end
  end

  def find_and_create_songs(dom)
    Song.PROVIDERS.keys.map do |provider|
      find_and_create_provider_songs(dom, provider)
    end.any?
  end

  def find_and_create_provider_songs(dom, provider)
    Song.PROVIDERS[provider][:queries].any? do |query_attrs|
      element, attribute, query = query_attrs

      song_nokos = dom.css(query)
      songs_found = false

      song_nokos.each do |song_noko|
        url = song_noko.get_attribute(attribute)
        url = Song.parse_iframe_src(url, provider) if element == :iframe

        song = Song.find_or_create_from_hash({
          :source_url => url,
          :provider => provider
        })

        if song
          self.songs << song
          songs_found = true
        end
      end

      songs_found
    end
  end

end

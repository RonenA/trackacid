class Feed < ActiveRecord::Base
  attr_accessible :title, :url, :site_url, :description, :content_selector

  validates_presence_of :title, :url

  has_many :entries, :dependent => :destroy
  has_many :songs, :through => :entries

  before_save :clean_site_url

  def self.create_from_hash(attributes)
    begin
      feed_data = SimpleRSS.parse(open(attributes[:url]))
      attributes[:title] = attributes[:title] || feed_data.title
      attributes[:site_url] = feed_data.link
      attributes[:description] = feed_data.description
      feed = Feed.create!(attributes)
      feed_data.entries.each do |entry_data|
        Entry.create_from_json!(entry_data, feed)
      end
    rescue SimpleRSSError
      return nil
    end

    feed
  end

  def reload
    begin
      feed_data = SimpleRSS.parse(open(url))
      self.site_url = feed_data.link
      self.description = feed_data.description

      save

      existing_entry_guids = entries.pluck(:guid).sort
      feed_data.entries.each do |entry_data|
        unless existing_entry_guids.include?(entry_data.guid)
          Entry.create_from_json!(entry_data, self)
        end
      end

      self
    rescue SimpleRSSError
      return false
    end
  end

  def self.reload_all
    all.each(&:reload)
  end

  def self.search(query)
    if query
      where("title LIKE ?", "%#{query}%")
    else
      all
    end
  end

  #For some reasons the site_url comes out with a <link> in from of it sometimes??
  def clean_site_url
    if site_url.starts_with?('<link>')
      dirty_url = site_url
      dirty_url.slice! "<link>"
      self.site_url = dirty_url
    end
  end

  #TODO: May be duplication by doing this query for each feed
  def as_json(options = {})
    json = super(:except => [:created_at, :updated_at, :content_selector])

    if options[:user]
      json[:unheard_count] = options[:user]
                              .user_songs
                              .joins(:song => :entries)
                              .where("entries.feed_id = ? AND
                                     user_songs.listened = 'f'", self.id)
                              .count('user_songs.id', :distinct => :true)
    end

    json
  end
end

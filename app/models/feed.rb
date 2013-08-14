class Feed < ActiveRecord::Base
  attr_accessible :title, :url

  validates_presence_of :title, :url

  has_many :entries, :dependent => :destroy
  has_many :songs, :through => :entries

  def self.create_from_hash(hash)
    begin
      feed_data = SimpleRSS.parse(open(hash[:url]))
      hash[:title] = feed_data.title
      feed = Feed.create!(hash)
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
      self.title = feed_data.title
      save!

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

  #TODO: May be duplication by doing this query for each feed
  def as_json(options = {})
    json = super(:only => [:title, :id, :url])

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

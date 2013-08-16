class UserSong < ActiveRecord::Base
  attr_accessible :song_id

  validates_presence_of :user, :song
  validates_uniqueness_of :user_id, :scope => [:song_id]

  before_create :set_defaults

  belongs_to :user
  belongs_to :song

  @@SONGS_PER_PAGE = 20
  paginates_per @@SONGS_PER_PAGE

  def self.SONGS_PER_PAGE
    @@SONGS_PER_PAGE
  end

  def set_defaults
    self.deleted = false
    self.listened = false
    self.favorited = false

    true
  end

  def as_json(options)
    json = super(:except => [:user_id, :song_id, :created_ay, :updated_at])

    song_json = JSON.parse(song.to_json(:except => [:created_at, :updated_at]))
    json.merge!(song_json)

    json[:entries] = entries_json.sort_by{ |e| e[:published_at] }
    json
  end

  def entries_json
    user_feed_ids = user.feed_ids
    song.entries.select do |entry|
      user_feed_ids.include?(entry.feed_id)
    end.map do |entry|
      JSON.parse(entry.to_json(:only => [:link, :published_at, :title, :feed_id]))
    end
  end

  #Defines record_listen, remove_listen etc..
  {:delete   => :deleted,
   :listen   => :listened,
   :favorite => :favorited}.each do |action, column|
    define_method "record_#{action}" do
      self.send("#{column}=", true);
      self.send("save");
    end

    define_method "remove_#{action}" do
      self.send("#{column}=", false);
      self.send("save");
    end
  end

end

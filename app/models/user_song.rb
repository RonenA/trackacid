class UserSong < ActiveRecord::Base
  attr_accessible :song_id

  validates_presence_of :user, :song

  before_create :set_defaults

  belongs_to :user
  belongs_to :song

  paginates_per 20

  def set_defaults
    self.deleted = false
    self.listened = false

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

  def record_delete
    self.deleted = true
    self.save
  end

  def record_listen
    self.listened = true
    self.save
  end

  def remove_listen
    self.listened = false
    self.save
  end
end

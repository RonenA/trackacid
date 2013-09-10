class UserFeed < ActiveRecord::Base
  attr_accessible :feed_id, :user_id

  validates_presence_of :feed, :user

  belongs_to :feed
  belongs_to :user

  after_destroy :destroy_user_songs_from_feed

  def destroy_user_songs_from_feed
    user.user_songs.includes(:song => :entries).each do |user_song|
      user_song.destroy if user_song.song.entries.all? do |entry|
        entry.feed_id == feed_id
      end
    end
  end

end

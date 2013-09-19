class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :remember_me, :hide_heard_songs

  after_create :set_requested_songs_at

  has_many :user_feeds, :dependent => :destroy
  has_many :feeds, :through => :user_feeds
  has_many :songs, :through => :feeds

  has_many :user_songs, :dependent => :destroy

  NEW_SONGS_PER_FEED = 20

  def set_requested_songs_at
    requested_songs_at = created_at
  end

  def make_user_songs
    last_user_song = user_songs.order(:created_at).last
    last_user_song_created_at = last_user_song ? last_user_song.created_at : 10.days.ago

    new_user_song_attrs = []

    songs.where("songs.created_at > ?", last_user_song_created_at).each do |song|
      new_user_song_attrs << {:song_id => song.id}
    end

    user_songs.create(new_user_song_attrs)

    # Stopped using this because Ben somehow ended up
    # with requested_songs_at getting updated but
    # no songs being created.

    #touch(:requested_songs_at)
  end

  def add_feed(feed)
    self.feeds << feed
    make_user_songs_for(feed)
  end

  def make_user_songs_for(feed)
    new_user_song_attrs = []

    feed.songs.limit(NEW_SONGS_PER_FEED).each do |song|
      new_user_song_attrs << {:song_id => song.id}
    end

    user_songs.create(new_user_song_attrs)
  end

  def song_list(page, feed_id = "all")

    if feed_id.is_a_number? && !self.feed_ids.include?(feed_id.to_i)
      data = Feed.find(feed_id).songs.includes(:entries)
    else
      data = user_songs.includes(:song => :entries)

      if feed_id == "favorites"
        data = data.where("favorited = 't'")
      elsif feed_id != "all"
        data = data.where("feed_id = ?", feed_id)
      end

      if hide_heard_songs && feed_id != "favorites"
        data = data.where("listened = 'f'")
      end
    end

    data
      .order("songs.first_published_at DESC")
      .page(page)
  end

  def remember_me
    true
  end

end
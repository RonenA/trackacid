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
    songs.where("songs.created_at > ?", requested_songs_at).each do |song|
      user_songs.create(:song_id => song.id)
    end

    touch(:requested_songs_at)
  end

  def add_feed(feed)
    self.feeds << feed
    make_user_songs_for(feed)
  end

  def make_user_songs_for(feed)
    feed.songs.limit(NEW_SONGS_PER_FEED).each do |song|
      user_songs.create(:song_id => song.id)
    end
  end

  def song_list(page, feed_id = "all")
    data = user_songs.includes(:song => :entries).where(:deleted => false)

    if feed_id != "all"
      data = data.where("feed_id = ?", feed_id)
    end

    if hide_heard_songs
      data = data.where("listened = 'f'")
    end

    data
      .order("songs.first_published_at DESC")
      .page(page)
  end

end
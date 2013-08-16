class AddIndexesToVariousThings < ActiveRecord::Migration
  def change
    #For find_or_intialize_by_source_url
    add_index :songs, :source_url, :unique => true
    #For songs.where("songs.created_at > ?", requested_songs_at)
    add_index :songs, :created_at
    #For validates_uniqueness_of :id_from_provider, :scope => [:provider]
    add_index :songs, [:id_from_provider, :provider], :unique => true
    #For .order("songs.first_published_at DESC")
    add_index :songs, :first_published_at, :order => :desc

    #For find_by_user_id_and_song_id
    add_index :user_songs, [:user_id, :song_id]
    #For user.user_songs
    add_index :user_songs, :user_id

    #For user.feeds
    add_index :user_feeds, :user_id

    #No longer needed as feeds are preloaded rather
    #than user generated.
    remove_index :feeds, :name => :index_feeds_on_url
  end
end

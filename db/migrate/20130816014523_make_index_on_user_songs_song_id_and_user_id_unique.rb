class MakeIndexOnUserSongsSongIdAndUserIdUnique < ActiveRecord::Migration
  def change
    remove_index :user_songs, :name => "index_user_songs_on_user_id_and_song_id"
    add_index :user_songs, [:user_id, :song_id], :unique => true
  end
end

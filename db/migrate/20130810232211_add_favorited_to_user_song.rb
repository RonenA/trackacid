class AddFavoritedToUserSong < ActiveRecord::Migration
  def change
    add_column :user_songs, :favorited, :boolean
  end
end

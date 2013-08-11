class RemoveFavouritedFromUserSong < ActiveRecord::Migration
  def up
    remove_column :user_songs, :favourited
  end

  def down
    add_column :user_songs, :favourited, :boolean
  end
end

class RenameHideUnheardSongsToHideHeardSongs < ActiveRecord::Migration
  def change
    rename_column :users, :hide_unheard_songs, :hide_heard_songs
  end
end

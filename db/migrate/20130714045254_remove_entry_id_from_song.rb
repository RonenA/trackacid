class RemoveEntryIdFromSong < ActiveRecord::Migration
  def change
    remove_column :songs, :entry_id
  end
end

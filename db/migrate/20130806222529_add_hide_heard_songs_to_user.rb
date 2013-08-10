class AddHideHeardSongsToUser < ActiveRecord::Migration
  def change
    add_column :users, :hide_unheard_songs, :boolean, :null => false, :default => false
  end
end

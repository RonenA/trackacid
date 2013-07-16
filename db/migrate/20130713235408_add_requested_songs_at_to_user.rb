class AddRequestedSongsAtToUser < ActiveRecord::Migration
  def change
    add_column :users, :requested_songs_at, :datetime
  end
end

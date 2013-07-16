class AddFirstPublishedAtToSong < ActiveRecord::Migration
  def change
    add_column :songs, :first_published_at, :datetime
  end
end

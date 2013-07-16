class RenameArtistToUserFromProvider < ActiveRecord::Migration
  def change
    rename_column :songs, :artist, :user_from_provider
  end
end

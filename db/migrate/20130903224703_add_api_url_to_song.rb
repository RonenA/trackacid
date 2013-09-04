class AddApiUrlToSong < ActiveRecord::Migration
  def change
    add_column :songs, :api_url, :string
  end
end

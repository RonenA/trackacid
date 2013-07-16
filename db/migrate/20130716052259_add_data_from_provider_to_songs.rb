class AddDataFromProviderToSongs < ActiveRecord::Migration
  def change
    remove_column :songs, :url
    add_column    :songs, :source_url, :text
    add_column    :songs, :id_from_provider, :string
    add_column    :songs, :public_link, :text
    add_column    :songs, :title, :text
    add_column    :songs, :artist, :string
    add_column    :songs, :description, :text
    add_column    :songs, :artwork_url, :text
    add_column    :songs, :kind, :string
    add_column    :songs, :download_url, :text
  end
end

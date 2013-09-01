class AddSecretTokenToSong < ActiveRecord::Migration
  def change
    add_column :songs, :secret_token, :string
  end
end

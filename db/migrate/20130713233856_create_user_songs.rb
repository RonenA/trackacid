class CreateUserSongs < ActiveRecord::Migration
  def change
    create_table :user_songs do |t|
      t.integer :user_id
      t.integer :song_id
      t.boolean :listened
      t.boolean :deleted

      t.timestamps
    end
  end
end

class CreateEntrySongs < ActiveRecord::Migration
  def change
    create_table :entry_songs do |t|
      t.integer :entry_id
      t.integer :song_id

      t.timestamps
    end
  end
end

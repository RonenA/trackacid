class CreateSongs < ActiveRecord::Migration
  def change
    create_table :songs do |t|
      t.text :url
      t.string :provider
      t.integer :entry_id

      t.timestamps
    end
  end
end

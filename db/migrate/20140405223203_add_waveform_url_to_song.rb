class AddWaveformUrlToSong < ActiveRecord::Migration
  def change
    add_column :songs, :waveform_url, :text
  end
end

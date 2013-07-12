class EntrySong < ActiveRecord::Base
  attr_accessible :entry_id, :song_id

  belongs_to :entry
  belongs_to :song
end

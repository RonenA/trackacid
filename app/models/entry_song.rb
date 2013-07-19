class EntrySong < ActiveRecord::Base
  attr_accessible :entry_id, :song_id

  belongs_to :entry
  belongs_to :song

  after_create :update_first_published

  def update_first_published
    if entry.published_at < song.first_published_at
      song.first_published_at = entry.published_at
      song.save!
    end
  end
end

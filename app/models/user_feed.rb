class UserFeed < ActiveRecord::Base
  attr_accessible :feed_id, :user_id

  validates_presence_of :feed, :user

  belongs_to :feed
  belongs_to :user
end

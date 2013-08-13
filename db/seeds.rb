# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

feeds = [
  {:url => 'http://feeds.feedburner.com/prettymuchamazing'},
  {:url => 'http://feeds.feedburner.com/2dopeboyz'},
  {:url => 'http://pitchfork.com/rss/reviews/best/tracks/',
   :content_selector => '#main'}
]

feeds.each do |feed|
  Feed.create_from_hash(feed)
end
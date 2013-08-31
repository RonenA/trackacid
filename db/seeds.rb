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
  {:url => 'http://pitchfork.com/rss/reviews/best/tracks/', :content_selector => '#main'},
  {:url => 'http://pitchfork.com/rss/reviews/best/albums/', :content_selector => '#main'},
  {:url => 'http://pitchfork.com/rss/news/',                :content_selector => '#main'},
  {:url => 'http://gorillavsbear.blogspot.com/atom.xml'},
  {:url => 'http://feeds.feedburner.com/hyptrk'},
  {:url => 'http://consequenceofsound.net/feed/'},
  {:url => 'http://www.rollingstone.com/siteServices/rss/musicNewsAndFeature'},
  {:url => 'http://www.thestrut.com/feed/'},
  {:url => 'http://feeds.feedburner.com/stereogum/cBYa'},
  {:url => 'http://feeds.feedburner.com/BrooklynVeganFeed'},
  {:url => 'http://noisey.vice.com/en_us/rss',              :content_selector => '.article_wrap'},
  {:url => 'http://cdnl.complex.com/feeds/channels/music.xml'}
]

feeds.each do |feed|
  Feed.create_from_hash(feed)
end
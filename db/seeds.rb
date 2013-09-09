# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

feeds = [
  {:url => 'http://feeds.feedburner.com/prettymuchamazing',
   :title => 'Pretty Much Amazing'},

  {:url => 'http://feeds.feedburner.com/2dopeboyz',
   :title => '2dopeboyz'},

  {:url => 'http://pitchfork.com/rss/reviews/best/tracks/',
   :title => 'Pitchfork - Best New Tracks',
   :content_selector => '#main'},

  {:url => 'http://pitchfork.com/rss/reviews/best/albums/',
   :title => 'Pitchfork - Best New Albums',
   :content_selector => '#main'},

  {:url => 'http://pitchfork.com/rss/news/',
   :title => 'Pitchfork - News',
   :content_selector => '#main'},

  {:url => 'http://gorillavsbear.blogspot.com/atom.xml',
   :title => 'Gorilla vs. Bear'},

  {:url => 'http://feeds.feedburner.com/hyptrk',
   :title => 'Hypetrak'},

  {:url => 'http://consequenceofsound.net/feed/',
   :title => 'Consequence of Sound'},

  {:url => 'http://www.rollingstone.com/siteServices/rss/musicNewsAndFeature',
   :title => 'Rolling Stone'},

  {:url => 'http://feeds.feedburner.com/stereogum/cBYa',
   :title => 'Stereogum'},

  {:url => 'http://feeds.feedburner.com/BrooklynVeganFeed',
   :title => 'Brooklyn Vegan'},

  {:url => 'http://noisey.vice.com/en_us/rss',
   :title => 'Noisey',
   :content_selector => '.article_wrap'},

  {:url => 'http://cdnl.complex.com/feeds/channels/music.xml',
   :title => 'Complex'},

  {:url => 'http://www.tinymixtapes.com/feed.xml',
   :title => 'Tiny Mix Tapes'},

  {:url => 'http://feeds.feedburner.com/OneHelloWorld',
   :title => 'One Hello World'},

  {:url => 'http://feeds.feedburner.com/dummymagazine',
   :title => 'Dummy Mag',
   :content_selector => '.single-entry-section'},

  {:url => 'http://www.iguessimfloating.net/feed',
   :title => "I Guess I'm Floating"},

  {:url => 'http://theneedledrop.com/feed/',
   :title => 'The Needle Drop'},

  {:url => 'http://feeds.feedburner.com/BPMfeed',
   :title => "Beats Per Minute"},

  {:url => "http://feeds.feedburner.com/EARGASMusic",
   :title => 'EARGASM'},

  {:url => 'http://www.discobelle.net/feed/',
   :title => "Disco Belle"},

  {:url => 'http://www.gottadancedirty.com/feed/',
   :title => 'Gotta Dance Dirty'}
]

feeds.each do |feed|
  Feed.create_from_hash(feed)
end
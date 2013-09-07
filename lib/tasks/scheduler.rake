desc "This task reloads the feeds"
task :reload_feeds => :environment do
  Feed.reload_all
end
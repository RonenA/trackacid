class RootController < ApplicationController

  def root
    @feeds = current_user.feeds.to_json
    @songs = current_user.songs.page(1).to_json(
              :include => {
                :entries => {
                  :only => [:link, :published_at, :title, :feed_id]
                }
              })
  end

end
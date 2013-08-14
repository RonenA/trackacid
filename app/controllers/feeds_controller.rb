class FeedsController < ApplicationController

  before_filter :authenticate_user!

  def index
    if params[:all]
      render :json => Feed.all.to_json
    else
      render :json => current_user.feeds
    end
  end

  def create
    feed = Feed.find(params[:feed_id])
    if feed
      current_user.add_feed(feed)
      render :json => feed.to_json({:user => current_user})
    else
      render :json => nil, status: :unprocessable_entity
    end
  end

end

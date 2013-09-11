class FeedsController < ApplicationController

  before_filter :authenticate_user!, :except => :index

  def index
    if params[:all]
      render :json => Feed.order("lower(title)").to_json
    elsif user_signed_in?
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

  def destroy
    render :json =>
      UserFeed
        .find_by_user_id_and_feed_id(current_user.id, params[:id])
          .destroy
  end

end

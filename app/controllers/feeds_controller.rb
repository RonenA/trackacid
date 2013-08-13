class FeedsController < ApplicationController

  before_filter :authenticate_user!

  # def index
  #   render :json => current_user.feeds
  # end

  # def create
  #   feed = Feed.find_or_create_by_url(params[:feed][:url])
  #   if feed
  #     current_user.add_feed(feed)
  #     render :json => feed
  #   else
  #     render :json => { error: "invalid url" }, status: :unprocessable_entity
  #   end
  # end

  # def show
  #   feed = Feed.find(params[:id])
  #   feed.reload
  #   render :json => feed.to_json(:include => [:songs])
  # end

end

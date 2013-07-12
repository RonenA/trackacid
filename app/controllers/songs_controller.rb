class SongsController < ApplicationController
  before_filter :authenticate_user!

  def index
    render :json => current_user.songs.uniq
  end
end
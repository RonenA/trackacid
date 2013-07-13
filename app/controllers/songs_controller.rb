class SongsController < ApplicationController
  before_filter :authenticate_user!

  def index
    # TODO: Why uniq after page? Why uniq at all?
    render :json => current_user.songs.page(params[:page]).uniq
  end
end
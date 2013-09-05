class SongsController < ApplicationController

  before_filter :authenticate_user!, :except => :index

  def index
    if user_signed_in?
      render :json => current_user.song_list(params[:page], params[:feed_id])
    else
      #Feed_id parameter is ignored when use is logged out
      render :json => Song.page(params[:page])
    end
  end

  def destroy
    render :json => current_user.user_songs
                      .find_by_song_id(params[:id])
                      .record_delete
  end

end
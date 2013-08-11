class SongsController < ApplicationController

  before_filter :authenticate_user!

  def index
    render :json => current_user.song_list(params[:page], params[:feed_id])
  end

  def destroy
    render :json => current_user.user_songs
                      .find_by_song_id(params[:id])
                      .record_delete
  end

end
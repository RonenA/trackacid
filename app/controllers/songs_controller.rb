class SongsController < ApplicationController
  before_filter :authenticate_user!

  def index
    render :json => current_user.user_songs
                      .includes(:song => :entries)
                      .where(:deleted => false)
                      .order("songs.first_published_at")
                      .page(params[:page])
  end

  def destroy
    if current_user.user_songs.find_by_song_id(params[:id]).record_delete
      render :json => true
    else
      render :json => false
    end
  end
end
class ListensController < ApplicationController

  def create
    if UserSong.find_by_user_id_and_song_id(current_user.id, params[:song_id])
               .record_listen
      render :json => true
    else
      render :json => false
    end
  end

end
class FavoritesController < ApplicationController

  def create
    render :json =>
      UserSong.find_by_user_id_and_song_id(current_user.id, params[:song_id])
        .record_favorite
  end

  def destroy
    render :json =>
      UserSong.find_by_user_id_and_song_id(current_user.id, params[:song_id])
         .remove_favorite
  end

end
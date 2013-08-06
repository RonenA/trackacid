class ListensController < ApplicationController

  before_filter :authenticate_user!

  def create
    #For marking entire feed as listened
    if params[:feed_id]

      if params[:feed_id] == "all"
        current_user.user_songs
         .where("listened = 'f'")
         .update_all("listened = 't'")
      else
        current_user.user_songs
         .joins(:song => :entries)
         .where("listened = 'f' AND entries.feed_id = ?", params[:feed_id])
         .update_all("listened = 't'")
      end


      render :json => current_user.feeds.to_json({:user => current_user})

    #For marking specific song as listened
    elsif params[:song_id]

      if UserSong.find_by_user_id_and_song_id(current_user.id, params[:song_id])
                 .record_listen
        render :json => true
      else
        render :json => false
      end

    end
  end

  def destroy
  	if UserSong.find_by_user_id_and_song_id(current_user.id, params[:song_id])
  			       .remove_listen
      render :json => true
    else
      render :json => false
    end
  end

end
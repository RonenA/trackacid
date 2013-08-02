class RootController < ApplicationController

  before_filter :authenticate_user!

  def root
    current_user.make_user_songs
    @user = current_user.to_json(:only => :email)
    @feeds = current_user.feeds.to_json({:user => current_user})
    @songs = current_user.song_list(1).to_json
    @songs_per_page = UserSong.SONGS_PER_PAGE
  end

end
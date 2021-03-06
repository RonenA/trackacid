class RootController < ApplicationController

  #before_filter :authenticate_user!

  def root
    if user_signed_in?
      current_user.make_user_songs
      @user = current_user.to_json(:only => [:email, :hide_heard_songs])
      @feeds = current_user.feeds.to_json({:user => current_user})
      @songs = current_user.song_list(1).to_json
    else #TODO: Why do I have to do this manually, why doesn't the as_json handle it?
      @songs = Song.page(1).to_json(:include => {:entries => {:except => :content_encoded}})
    end

    @all_feeds = Feed.order("lower(title)").to_json

    @songs_per_page = UserSong.SONGS_PER_PAGE
  end

end
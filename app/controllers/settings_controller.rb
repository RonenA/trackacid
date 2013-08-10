class SettingsController < ApplicationController

  @@SETTINGS_KEYS = ["hide_heard_songs"]

  def update
    params[:settings].keep_if do |k, v|
      @@SETTINGS_KEYS.include?(k)
    end

    render :json => current_user.update_attributes(params[:settings])
  end

end
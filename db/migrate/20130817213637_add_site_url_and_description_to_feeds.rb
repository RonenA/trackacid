class AddSiteUrlAndDescriptionToFeeds < ActiveRecord::Migration
  def change
    add_column :feeds, :site_url, :string
    add_column :feeds, :description, :text
  end
end

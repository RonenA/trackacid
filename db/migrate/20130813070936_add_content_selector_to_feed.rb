class AddContentSelectorToFeed < ActiveRecord::Migration
  def change
    add_column :feeds, :content_selector, :string, default: "body"
  end
end

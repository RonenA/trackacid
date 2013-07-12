class RemoveJsonFromEntry < ActiveRecord::Migration
  def change
    remove_column :entries, :json
  end
end

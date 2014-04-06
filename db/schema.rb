# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140405223203) do

  create_table "entries", :force => true do |t|
    t.string   "guid",            :null => false
    t.string   "link",            :null => false
    t.string   "title",           :null => false
    t.datetime "published_at",    :null => false
    t.integer  "feed_id",         :null => false
    t.text     "content_encoded", :null => false
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "entries", ["feed_id"], :name => "index_entries_on_feed_id"
  add_index "entries", ["guid"], :name => "index_entries_on_guid", :unique => true

  create_table "entry_songs", :force => true do |t|
    t.integer  "entry_id"
    t.integer  "song_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "feeds", :force => true do |t|
    t.string   "url",                                  :null => false
    t.string   "title",                                :null => false
    t.datetime "created_at",                           :null => false
    t.datetime "updated_at",                           :null => false
    t.string   "content_selector", :default => "body"
    t.string   "site_url"
    t.text     "description"
  end

  create_table "songs", :force => true do |t|
    t.string   "provider"
    t.datetime "created_at",         :null => false
    t.datetime "updated_at",         :null => false
    t.datetime "first_published_at"
    t.text     "source_url"
    t.string   "id_from_provider"
    t.text     "public_link"
    t.text     "title"
    t.string   "user_from_provider"
    t.text     "description"
    t.text     "artwork_url"
    t.string   "kind"
    t.text     "download_url"
    t.integer  "duration"
    t.string   "secret_token"
    t.string   "api_url"
    t.text     "waveform_url"
  end

  add_index "songs", ["created_at"], :name => "index_songs_on_created_at"
  add_index "songs", ["first_published_at"], :name => "index_songs_on_first_published_at"
  add_index "songs", ["id_from_provider", "provider"], :name => "index_songs_on_id_from_provider_and_provider", :unique => true
  add_index "songs", ["source_url"], :name => "index_songs_on_source_url", :unique => true

  create_table "user_feeds", :force => true do |t|
    t.integer  "user_id"
    t.integer  "feed_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "user_feeds", ["user_id"], :name => "index_user_feeds_on_user_id"

  create_table "user_songs", :force => true do |t|
    t.integer  "user_id"
    t.integer  "song_id"
    t.boolean  "listened"
    t.boolean  "deleted"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.boolean  "favorited"
  end

  add_index "user_songs", ["user_id", "song_id"], :name => "index_user_songs_on_user_id_and_song_id", :unique => true
  add_index "user_songs", ["user_id"], :name => "index_user_songs_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "",    :null => false
    t.string   "encrypted_password",     :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                                :null => false
    t.datetime "updated_at",                                :null => false
    t.datetime "requested_songs_at"
    t.boolean  "hide_heard_songs",       :default => false, :null => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end

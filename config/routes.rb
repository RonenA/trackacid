NewReader::Application.routes.draw do
  root to: "root#root"

  devise_for :users
  devise_scope :users do
    put "users/settings", :to => "settings#update", :as => "update_user_settings"
  end

  resources :feeds, only: [:index, :create, :show] do
    resources :entries, only: [:index]
    resources :listens, only: [:create]
  end

  resources :songs, only: [:index, :destroy] do
    resource :listen, only: [:create, :destroy]
  end
end

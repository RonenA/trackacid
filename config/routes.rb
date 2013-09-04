NewReader::Application.routes.draw do
  root to: "root#root"

  devise_for :users, :controllers => {registrations: 'registrations'}
  devise_scope :user do
    #path to update settings
    put "users/settings", :to => "settings#update", :as => :update_user_settings

    #custom login path
    get 'login' => 'devise/sessions#new', :as => :new_user_session
  end

  resources :feeds, only: [:index, :create, :destroy] do
    resources :entries, only: [:index]
    resources :listens, only: [:create]
  end

  resources :songs, only: [:index, :destroy] do
    resource :listen, only: [:create, :destroy]
    resource :favorite, only: [:create, :destroy]
  end
end

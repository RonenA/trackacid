NewReader::Application.routes.draw do
  devise_for :users

  root to: "feeds#index"

  resources :feeds, only: [:index, :create, :show] do
    resources :entries, only: [:index]
  end

  resources :songs, only: [:index]
end

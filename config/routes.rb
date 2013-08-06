NewReader::Application.routes.draw do
  devise_for :users

  root to: "root#root"

  resources :feeds, only: [:index, :create, :show] do
    resources :entries, only: [:index]
    resources :listens, only: [:create]
  end

  resources :songs, only: [:index, :destroy] do
    resource :listen, only: [:create, :destroy]
  end
end

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post 'auth/register', to: 'auth#register'
      post 'auth/login', to: 'auth#login'
      get 'auth/me', to: 'auth#me'

      # Resource routes
      resources :projects
      resources :workers
      resources :attendances do
        collection do
          post :bulk_create
        end
      end
      resources :payments
      resources :materials
      resources :expenses
      resources :client_advances
      resources :invoices
      resources :site_photos
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end

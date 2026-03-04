Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication routes
      post 'auth/register', to: 'auth#register'
      post 'auth/login', to: 'auth#login'
      get  'auth/me', to: 'auth#me'
      post 'auth/forgot_password', to: 'auth#forgot_password'
      post 'auth/reset_password', to: 'auth#reset_password'
      get  'auth/users_list', to: 'auth#users_list'
      post 'auth/quick_login', to: 'auth#quick_login'

      # Dashboard stats
      get 'dashboard/stats', to: 'dashboard#stats'

      # Reports
      get 'reports/worker_summary', to: 'reports#worker_summary'
      get 'reports/project_summary', to: 'reports#project_summary'
      get 'reports/monthly_payroll', to: 'reports#monthly_payroll'
      get 'reports/worker_performance', to: 'reports#worker_performance'

      # Notifications
      get  'notifications', to: 'notifications#index'
      get  'notifications/unread_count', to: 'notifications#unread_count'
      patch 'notifications/mark_all_read', to: 'notifications#mark_all_read'
      patch 'notifications/:id/mark_read', to: 'notifications#mark_read'

      # Resource routes
      resources :projects
      resources :workers
      resources :attendances do
        collection do
          post :bulk_create
        end
      end
      resources :payments do
        collection do
          post :bulk_create
        end
      end
      resources :materials
      resources :expenses
      resources :client_advances
      resources :invoices
      resources :site_photos
      resources :equipments
      resources :work_diaries
      resources :worker_loans
      resources :project_milestones
      resources :subcontractors
    end
  end
end

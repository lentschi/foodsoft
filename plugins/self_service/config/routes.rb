Rails.application.routes.draw do
  scope '/:foodcoop' do
    resources :self_service, only: [:index]
  end

  resources :self_service_articles
  resources :self_service_transactions
end

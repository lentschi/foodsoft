module FoodsoftSelfService
  class Engine < ::Rails::Engine
    def navigation(primary, context)
      return unless FoodsoftSelfService.enabled?
      return if primary[:orders].nil?

      sub_nav = primary[:orders].sub_navigation
      sub_nav.items <<
        SimpleNavigation::Item.new(primary, :self_service, I18n.t('navigation.self_service'), context.self_service_index_path)
    end

    initializer 'foodsoft_self_service.model_patches' do
      if Rails.configuration.cache_classes
        GroupOrderArticlePatch.install
        GroupOrderPatch.install
        OrderArticlePatch.install
        OrderPatch.install
        FinancialTransactionPatch.install
        OrdergroupPatch.install

        OrdersControllerPatch.install
      else
        ActiveSupport::Reloader.to_prepare do
          GroupOrderArticlePatch.install
          GroupOrderPatch.install
          OrderArticlePatch.install
          OrderPatch.install
          FinancialTransactionPatch.install
          OrdergroupPatch.install

          OrdersControllerPatch.install
        end
      end
    end

    initializer 'foodsoft_self_service.assets.precompile' do |app|
      app.config.assets.precompile += %w(self_service.scss)
    end
  end
end

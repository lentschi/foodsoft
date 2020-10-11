module FoodsoftSelfService
  module OrdersControllerPatch
    def self.included(base)
      base.class_eval do
        after_action :enqueue_received_order_mail, only: [:receive], if: -> { request.post? }

        def enqueue_received_order_mail
          Resque.enqueue(SelfServiceUserNotifier, FoodsoftConfig.scope, 'received_order', @order.id)
        end
      end
    end

    def self.install
      OrdersController.send :include, self
    end
  end
end

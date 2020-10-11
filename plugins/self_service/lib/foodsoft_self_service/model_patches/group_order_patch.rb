module FoodsoftSelfService
  module GroupOrderPatch
    def self.included(base)
      base.class_eval do
        def received?
          return false if order_articles.count.zero?

          !order_articles.first.units_received.nil?
        end
      end
    end

    def self.install
      GroupOrder.send :include, self
    end
  end
end

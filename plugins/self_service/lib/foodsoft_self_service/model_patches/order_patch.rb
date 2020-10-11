module FoodsoftSelfService
  module OrderPatch
    def self.included(base)
      base.class_eval do
        has_many :received_order_articles, -> { where 'units_received > 0' }, class_name: 'OrderArticle'
      end
    end

    def self.install
      Order.send :include, self
    end
  end
end

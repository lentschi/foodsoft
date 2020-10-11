require 'foodsoft_self_service/engine'
require 'foodsoft_self_service/model_patches/group_order_article_patch'
require 'foodsoft_self_service/model_patches/group_order_patch'
require 'foodsoft_self_service/model_patches/order_article_patch'
require 'foodsoft_self_service/model_patches/order_patch'
require 'foodsoft_self_service/model_patches/financial_transaction_patch'
require 'foodsoft_self_service/model_patches/ordergroup_patch'

require 'foodsoft_self_service/controller_patches/orders_controller_patch'

module FoodsoftSelfService
  def self.enabled?
    FoodsoftConfig[:use_self_service]
  end
end

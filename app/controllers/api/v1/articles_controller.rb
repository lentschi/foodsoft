class Api::V1::ArticlesController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def index
    render_collection search_scope
  end

  def search_scope
    merged_scope = merge_ordered_scope(super, params.fetch(:q, {})[:ordered])
    supplier_id = params.fetch(:supplier_id)
    merged_scope = merged_scope.where(order_id: order_id) unless supplier_id.nil?
    merged_scope
  end

  def scope
    Article
  end
end

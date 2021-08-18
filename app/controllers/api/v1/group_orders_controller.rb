class Api::V1::GroupOrdersController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def show
    render json: scope.find(params.require(:id))
  end

  private

  def scope
    GroupOrder.includes(:group_order_articles)
  end
end

class Api::V1::OrdersController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def index
    render_collection search_scope
  end

  def today_page
    order_hash = Hash.new
    order_hash[params.require(:order)] = params.require(:order_direction)
    render json: (scope.order(order_hash).where('ends < ?', Time.now).count / params.require(:per_page).to_i).floor
  end

  def show
    render json: scope.find(params.require(:id))
  end

  private

  def scope
    Order.includes(:supplier)
  end
end

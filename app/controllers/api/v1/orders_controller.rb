class Api::V1::OrdersController < Api::V1::BaseController
  include Concerns::CollectionScope
  include Concerns::ReceiveOrder
  include ErrorSerializer

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def index
    orders = search_scope
    render json: orders, meta: collection_meta(search_scope), current_ordergroup: current_ordergroup
  end

  def today_page
    order_hash = Hash.new
    order_hash[params.require(:order)] = params.require(:order_direction)
    render json: (scope.order(order_hash).where('ends < ? OR ends IS NULL', Time.now).count / params.require(:per_page).to_f).ceil
  end

  def show
    render json: scope.find(params.require(:id)), current_ordergroup: current_ordergroup
  end

  def create
    order = Order.new(create_params.merge(created_by: current_user, updated_by: current_user))
    if order.save
      render json: order, current_ordergroup: current_ordergroup
    else
      render json: ErrorSerializer.serialize(order.errors), status: :bad_request
    end
  end

  def update
    order = Order.find(update_params.require(:id))
    if order.update_attributes(update_params.merge(updated_by: current_user))
      render json: order, current_ordergroup: current_ordergroup
    else
      render json: ErrorSerializer.serialize(order.errors), status: :bad_request
    end
  end

  def destroy
    Order.find(params.require(:id)).destroy
  end

  def finish
    Order.transaction do
      order = Order.find(params.require(:id))
      order.finish!(current_user)
      render json: order, current_ordergroup: current_ordergroup
    rescue => error
      render json: ErrorSerializer.serialize(order.errors), status: :bad_request
    end
  end

  def receive
    order = nil
    Order.transaction do
      order = Order.find(params.require(:id))
      s = update_order_amounts
      order.update_attribute(:state, 'received') if order.state != 'received'

      notice = (s ? I18n.t('orders.receive.notice', :msg => s) : I18n.t('orders.receive.notice_none'))
    end
    NotifyReceivedOrderJob.perform_later(order)

    render json: order, current_ordergroup: current_ordergroup, notice: notice
  end


  private

  def create_params
    params.permit(:supplier_id, :starts, :ends, :pickup, article_ids: [])
  end

  def update_params
    params.permit(:id, :starts, :ends, :pickup, :ignore_warnings, article_ids: [])
  end

  def receive_params
    params.permit(:id, :rest_to_tolerance, :rest_to_stock, article_ids: [])
  end

  def scope
    Order.includes([:supplier, task: [:users, :responsible_user]])
  end
end

class Api::V1::Finance::BalancingController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'finance:user' }

  def close
    Order.transaction do
      order = Order.find(close_params.require(:id))
      type = FinancialTransactionType.find_by_id(close_params.permit(:type)[:type])
      order.close!(current_user, type)
      render json: order, current_ordergroup: current_ordergroup
    end
  rescue => error
    render json: ErrorSerializer.serialize(order.errors), status: :bad_request
  end

  private
  def close_params
    params.permit(:id, :type)
  end
end

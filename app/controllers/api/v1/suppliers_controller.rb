class Api::V1::SuppliersController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def index
    render json: Supplier.all, fields: [:id, :name, :address, :order_howto, :phone, :phone2, :order_repetition_setting_id]
  end

  def show
    render json: scope.find(params.require(:id))
  end

  private

  def scope
    Supplier.includes(:articles)
  end
end

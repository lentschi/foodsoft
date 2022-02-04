class Api::V1::GroupOrdersController < Api::V1::BaseController
  include Concerns::CollectionScope

  # TODO: this controller should probably be moved to the user namespace?
  before_action -> { doorkeeper_authorize! 'group_orders:user' }

  def show
    render json: scope.find(params.require(:id))
  end

  def create
    update_group_order! do
      current_ordergroup.group_orders.find_or_create_by!(order_id: params.require(:order_id))
    end
  end

  def update
    update_group_order! do
      current_ordergroup.group_orders.find(params.require(:id))
    end
  end

  private

  def update_group_order!
    go = nil

    GroupOrder.transaction do
      go = yield

      update_params.require(:group_order_articles).each do |goa_param|
        oa = go.order.order_articles.find(goa_param.require(:order_article_id))
        goa = GroupOrderArticle.find_or_create_by!(group_order_id: go.id, order_article_id: oa.id)
        goa.update_quantities((goa_param.require(:quantity)).to_i, (goa_param.require(:tolerance)).to_i)
        oa.update_results!
      end
      go.update_price!
      go.update_attributes! updated_by: current_user
    end

    render json: go
  end

  def scope
    GroupOrder.includes(:group_order_articles)
  end

  def update_params
    params.permit(group_order_articles: [:order_article_id, :quantity, :tolerance])
  end
end

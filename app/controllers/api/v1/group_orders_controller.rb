class Api::V1::GroupOrdersController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def show
    render json: scope.find(params.require(:id))
  end

  def create
  end

  def update
    go = GroupOrder.find(params[:id])

    # TODO check user
    update_params[:group_order_articles].each do |goa_param|
      # TODO: check if goa_param.order_article_id is valid for go
      goa = GroupOrderArticle.find_or_create_by!(group_order_id: go.id, order_article_id: goa_param[:order_article_id])
      goa.quantity = goa_param[:quantity]
      goa.tolerance = goa_param[:tolerance]
      goa.save

      # TODO: Update derived fields
    end

    go = GroupOrder.find(params[:id])
    render json: go
  end

  private

  def scope
    GroupOrder.includes(:group_order_articles)
  end

  def update_params
    params.permit(group_order_articles: [:order_article_id, :quantity, :tolerance])
  end
end

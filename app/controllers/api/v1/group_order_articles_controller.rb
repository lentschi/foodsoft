class Api::V1::GroupOrderArticlesController < Api::V1::BaseController
  include Concerns::CollectionScope

  # TODO: this controller should probably be moved to the user namespace?
  before_action -> { doorkeeper_authorize! 'group_orders:user' }

  def update
    group_order_article = nil
    GroupOrderArticle.transaction do
      group_order_article = GroupOrderArticle.find(update_params.require(:id))
      group_order_article.update_attributes(update_params.require(:group_order_article))

      group_order_article.update_summaries
    end

    render json: group_order_article
  end

  private

  def update_params
    params.permit(:id, group_order_article: [:result])
  end

end

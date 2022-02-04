class Api::V1::OrderArticlesController < Api::V1::BaseController
  include Concerns::CollectionScope

  before_action -> { doorkeeper_authorize! 'orders:read', 'orders:write' }

  def index
    render_collection search_scope
  end

  def show
    render json: scope.find(params.require(:id))
  end

  private

  def scope
    OrderArticle.includes(:article_price, article: :supplier)
  end

  def search_scope
    merged_scope = merge_ordered_scope(super, params.fetch(:q, {})[:ordered])
    order_id = params.fetch(:order_id)
    merged_scope = merged_scope.where(order_id: order_id) unless order_id.nil?
    merged_scope
  end

  def merge_ordered_scope(scope, ordered)
    if ordered.blank?
      scope
    elsif ordered == 'member' && current_ordergroup
      scope.joins(:group_order_articles).merge(current_ordergroup.group_order_articles)
    elsif ordered == 'all'
      table = scope.arel_table
      scope.where(table[:quantity].gt(0).or(table[:tolerance].gt(0)))
    elsif ordered == 'supplier'
      scope.ordered
    else
      scope.none # as a hint that it's an invalid value
    end
  end
end

module Concerns::ReceiveOrder
  extend ActiveSupport::Concern

  protected

  def update_order_amounts
    return if not params[:order_articles]

    # where to leave remainder during redistribution
    rest_to = []
    rest_to << :tolerance if params[:rest_to_tolerance]
    rest_to << :stock if params[:rest_to_stock]
    rest_to << nil
    # count what happens to the articles:
    #   changed, rest_to_tolerance, rest_to_stock, left_over
    counts = [0] * 4
    cunits = [0] * 4
    # This was once wrapped in a transaction, but caused
    # "MySQL lock timeout exceeded" errors. It's ok to do
    # this article-by-article anway.
    params[:order_articles].each do |oa_id, oa_params|
      unless oa_params.blank?
        oa = OrderArticle.find(oa_id)
        # update attributes; don't use update_attribute because it calls save
        # which makes received_changed? not work anymore
        oa.attributes = oa_params
        if oa.units_received_changed?
          counts[0] += 1
          unless oa.units_received.blank?
            cunits[0] += oa.units_received * oa.article.unit_quantity
            oacounts = oa.redistribute oa.units_received * oa.price.unit_quantity, rest_to
            oacounts.each_with_index { |c, i| cunits[i + 1] += c; counts[i + 1] += 1 if c > 0 }
          end
        end
        oa.save!
      end
    end
    return nil if counts[0] == 0

    notice = []
    notice << I18n.t('orders.update_order_amounts.msg1', count: counts[0], units: cunits[0])
    notice << I18n.t('orders.update_order_amounts.msg2', count: counts[1], units: cunits[1]) if params[:rest_to_tolerance]
    notice << I18n.t('orders.update_order_amounts.msg3', count: counts[2], units: cunits[2]) if params[:rest_to_stock]
    if counts[3] > 0 || cunits[3] > 0
      notice << I18n.t('orders.update_order_amounts.msg4', count: counts[3], units: cunits[3])
    end
    notice.join(', ')
  end
end

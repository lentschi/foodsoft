class SelfServiceMailer < Mailer
  # Sends order received info for specific Ordergroup
  def order_received(user, group_order)
    @order        = group_order.order
    @group_order  = group_order

    order_articles = @order.order_articles.reject { |oa| oa.units_received.nil? }
    @abundant_articles = order_articles.select { |oa| oa.difference_received_ordered.positive? }
    @scarce_articles = order_articles.select { |oa| oa.difference_received_ordered.negative? }

    mail to: user,
         subject: I18n.t('self_service_mailer.order_received.subject', name: group_order.order.name)
  end
end

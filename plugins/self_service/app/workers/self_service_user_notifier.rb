# This plain ruby class should handle all user notifications, called by various models
class SelfServiceUserNotifier < UserNotifier
  @queue = :foodsoft_notifier

  def self.received_order(args)
    order_id = args.first
    Order.find(order_id).group_orders.each do |group_order|
      next if group_order.ordergroup.nil?

      group_order.ordergroup.users.each do |user|
        next unless user.settings.notify['order_received']

        Mailer.deliver_now_with_user_locale user do
          SelfServiceMailer.order_received(user, group_order)
        end
      end
    end
  end
end

class Api::V1::StockServicesController < Api::V1::BaseController
  include Concerns::CollectionScope

  def update
    Order.transaction do
      order = Order.find(update_params.require(:order_id))
      task = order.task
      task = Task.new if task.nil?
      task.name = 'TODO'
      task.duration = 1
      task.due_date = order.pickup
      if update_params.require(:as_responsible_user)
        task.responsible_user_id = current_user.id
      elsif task.responsible_user_id == current_user.id
        task.responsible_user_id = nil
      end
      task.users << current_user unless task.users.exists?(current_user.id)
      task.save!
      if order.task_id != task.id
        order.task_id = task.id
        order.save!
      end

      render json: task
    end
  end

  def destroy
    Assignment.includes(task: [:order]).where(user_id: current_user.id, task: { orders: {id: destroy_params.require(:order_id) } }).destroy_all
    task = Task.includes(:order).where(responsible_user_id: current_user.id, orders: {id: destroy_params.require(:order_id) }).update_all(responsible_user_id: nil)
  end

  private

  def index_params
    params.permit(:order_id)
  end

  def update_params
    params.permit(:order_id, :as_responsible_user)
  end

  def destroy_params
    params.permit(:order_id)
  end
end

class OrderSerializer < ActiveModel::Serializer
  include ApplicationHelper

  attributes :id, :name, :starts, :ends, :boxfill, :pickup, :state, :is_boxfill, :supplier_id, :supplier, :own_group_order_id

  belongs_to :task

  def is_boxfill
    object.boxfill?
  end

  def own_group_order
    object.group_order(@instance_options[:current_ordergroup])
  end

  def own_group_order_id
    own_group_order.id unless own_group_order.nil?
  end

  # TODO: Move this outside the order JSON:
  def notice
    @instance_options[:notice]
  end

  def supplier
    return nil if object.supplier.nil?

    adapter = ActiveModelSerializers::SerializableResource.new(object.supplier, adapter: :json, fields: [:id, :name, :order_repetition_setting_id, :order_repetition_setting])
    adapter.serializable_hash
  end
end

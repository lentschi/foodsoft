class OrderSerializer < ActiveModel::Serializer
  include ApplicationHelper

  attributes :id, :name, :starts, :ends, :boxfill, :pickup, :state, :is_boxfill, :supplier_id, :supplier, :own_group_order, :own_group_order_id

  def is_boxfill
    object.boxfill?
  end

  def own_group_order
    object.group_order(@instance_options[:current_ordergroup])
  end

  def own_group_order_id
    own_group_order.id unless own_group_order.nil?
  end
end

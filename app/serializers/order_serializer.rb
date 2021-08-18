class OrderSerializer < ActiveModel::Serializer
  attributes :id, :name, :starts, :ends, :boxfill, :pickup, :state, :is_boxfill, :supplier_id, :supplier

  def is_boxfill
    object.boxfill?
  end
end

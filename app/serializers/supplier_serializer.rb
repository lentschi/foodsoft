class SupplierSerializer < ActiveModel::Serializer
  attributes :id, :name, :address, :order_howto, :phone, :phone2, :articles, :order_repetition_setting_id

  belongs_to :order_repetition_setting
end

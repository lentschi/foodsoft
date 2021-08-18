class SupplierSerializer < ActiveModel::Serializer
  attributes :id, :name, :address, :order_howto, :phone, :phone2, :articles
end

class OrderArticleSerializer < ActiveModel::Serializer
  attributes :id, :order_id, :price
  attributes :quantity, :tolerance, :units_to_order, :units_received

  has_one :article

  def price
    object.price.fc_price.to_f
  end
end

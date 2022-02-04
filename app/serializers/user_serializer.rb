class UserSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :name, :email, :locale, :avatar_url

  def avatar_url
    rails_blob_path(object.avatar, only_path: true) if object.avatar.attached?
  end
end

class TaskSerializer < ActiveModel::Serializer
  include ApplicationHelper

  attributes :id, :responsible_user_id, :users

  def users
    ret = []
    object.assignments.each do |assignment|
      adapter = ActiveModelSerializers::SerializableResource.new(assignment.user, adapter: :json)
      user_hash = adapter.serializable_hash
      ret << user_hash
    end

    ret
  end
end

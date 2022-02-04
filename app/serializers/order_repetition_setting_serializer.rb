class OrderRepetitionSettingSerializer < ActiveModel::Serializer
  include ApplicationHelper

  attributes :id, :starts_at, :frequency, :pickup_offset
end

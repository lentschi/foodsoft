class OrderRepetitionSetting < ApplicationRecord
  has_one :supplier

  validates :frequency, :numericality => { :greater_than => 0 }
  validates :pickup_offset, :numericality => { :greater_than => 0 }
end

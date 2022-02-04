class Api::V1::OrderRepetitionSettingsController < Api::V1::BaseController
  include Concerns::CollectionScope

  def update
    setting = nil
    success = false

    Supplier.transaction do
      supplier = Supplier.find(update_params.require(:supplier_id))
      setting = supplier.order_repetition_setting
      setting = OrderRepetitionSetting.new if setting.nil?
      setting.frequency = update_params.require(:frequency)
      setting.starts_at = update_params.require(:starts_at)
      setting.pickup_offset = update_params.require(:pickup_offset)
      success = setting.save

      if success
        supplier.order_repetition_setting = setting
        supplier.save!
      end
    end

    if success
      render json: setting
    else
      render json: ErrorSerializer.serialize(setting.errors), status: :bad_request
    end
  end

  def destroy
    Supplier.transaction do
      supplier = Supplier.find(destroy_params.require(:supplier_id))

      unless supplier.order_repetition_setting.nil?
        order_repetition_setting = supplier.order_repetition_setting
        supplier.update_attribute(:order_repetition_setting_id, nil)
        order_repetition_setting.destroy
      end
    end
  end

  private
  def update_params
    params.permit(:supplier_id, :frequency, :starts_at, :pickup_offset)
  end

  def destroy_params
    params.permit(:supplier_id)
  end
end

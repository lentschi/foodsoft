class Api::V1::WebpushNotificationEndpointsController < Api::V1::BaseController
  def update
    endpoint = nil
    WebpushNotificationEndpoint.transaction do
      endpoint = WebpushNotificationEndpoint.find_by(url: update_params.require(:url), p256dh_key: update_params.require(:p256dh_key), auth_key: update_params.require(:auth_key), user_id: current_user.id)

      if endpoint.nil?
        endpoint = WebpushNotificationEndpoint.new
        endpoint.url = update_params.require(:url)
        endpoint.p256dh_key = update_params.require(:p256dh_key)
        endpoint.auth_key = update_params.require(:auth_key)
        endpoint.user_id = current_user.id
        endpoint.save
      end
    end

    render json: endpoint
  end

  def destroy
    WebpushNotificationEndpoint.where(user_id: current_user.id, id: destroy_params.require(:id)).destroy_all
  end

  private

  def update_params
    params.permit(:url, :p256dh_key, :auth_key)
  end

  def destroy_params
    params.permit(:id)
  end
end

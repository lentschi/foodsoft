class Api::V1::Session::SessionsController < ActionController::Base
  def new
    render json: {hello: 12}
  end
end
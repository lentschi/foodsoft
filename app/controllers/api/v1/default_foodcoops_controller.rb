class Api::V1::DefaultFoodcoopsController < Api::V1::BaseController
  def show
    render json: FoodsoftConfig[:default_scope].to_json
  end
end

class Api::V1::PickupController < Api::BaseController
  
  skip_before_action :verify_authenticity_token 
  # This endpoint is an API, don’t enforce CSRF
  # prevents foodsoft CSRF error if API is called via AJAX request

  def index   
   # get group orders for ordergroup with ordergroup_id
    ordergroup_id = params.fetch(:ordergroup_id, nil) || 
      (current_user.ordergroup ? current_user.ordergroup.id : nil)
    logger.debug "pickup-controller: ordergroup_id #{ordergroup_id}"
    base_scope = GroupOrder
      .includes(group_order_articles: { order_article: {article_version: :article_unit_ratios} },
                order: [:supplier, :comments])
      .references(:orders)
      .where(ordergroup_id: ordergroup_id)
      .limit(200)
    group_orders = base_scope.where(
      orders: {
        state: "open",
        pickup: nil, # z.B. Leergut Rückgabe
        ends: last_week
      }
    ).or(
      base_scope.where(
        orders: {
          state: "open",
          supplier_id: nil, # Lager
          ends: last_week
        }
      )  
    ).or(
      base_scope.where(
        orders: {
          state: %w[finished received closed],
          pickup: last_weeks
        }
      )
    )

  
    render json: 
    {
      group_orders: group_orders.map { |go|
        {
          id: go.id, 
          ends: go.order.ends, # date where order ends # rubymate:disable-line
          pickup: go.order.pickup, # date where order pickup starts
          state: go.order.state,
          order_id: go.order.id,
          name: go.order.name,
          supplier_note: go.order.supplier ? go.order.supplier.note : ""  ,
          articles: go.group_order_articles.map { |goa|
            a = goa.order_article.article_version
            { id: goa.id,
              name: a.name,
              unit: a.unit,
              gramm_per_ordered_unit: begin
                  a.convert_quantity(1, a.group_order_unit, "GRM")
                rescue PriceCalculation::UnsupportedUnitConversionError
                  nil
                end,
              price_per_ordered_unit: a.convert_quantity(a.price, a.supplier_order_unit, a.group_order_unit),
              deposit: a.deposit,

              ordered: goa.quantity,
              tolerance: goa.tolerance, 
              received: goa.result,   

              grouporder_article_id: goa.order_article.id, # new !!! 
              ordered_total: goa.order_article.quantity, # new !!!
              received_total: goa.order_article.units_received, # new!!!
            }
          },
          comments: go.order.comments,
        }
      }         
    }
  end



  private

  def time_now
    if Rails.env.development?
      #Time.new(2025, 12, 17)
      Time.new(2026, 10, 11)
    else
      Time.current
    end
  end

  def last_week
    time_now.weeks_ago(1)..time_now.next_year
  end

  def last_weeks
    time_now.weeks_ago(params.fetch(:weeks, 5))..time_now.weeks_since(1)
  end

  def unit_name(unit)
    ArticleUnitsLib.get_translated_symbol_for_code(unit) || ArticleUnitsLib.get_translated_name_for_code(unit)
  end
end


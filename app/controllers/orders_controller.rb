#
# Controller for managing orders, i.e. all actions that require the "orders" role.
# Normal ordering actions of members of order groups is handled by the OrderingController.
class OrdersController < ApplicationController
  include Concerns::SendOrderPdf
  include Concerns::ReceiveOrder

  before_action :authenticate_pickups_or_orders
  before_action :authenticate_orders, except: [:receive, :receive_on_order_article_create, :receive_on_order_article_update, :show]
  before_action :remove_empty_article, only: [:create, :update]

  # List orders
  def index
    @open_orders = Order.open.includes(:supplier)
    @finished_orders = Order.finished_not_closed.includes(:supplier)
    @per_page = 15
    if params['sort']
      sort = case params['sort']
             when "supplier"         then "suppliers.name, ends DESC"
             when "pickup"           then "pickup DESC"
             when "ends"             then "ends DESC"
             when "supplier_reverse" then "suppliers.name DESC"
             when "ends_reverse"     then "ends"
             end
    else
      sort = "ends DESC"
    end
    @suppliers = Supplier.having_articles.order('suppliers.name')
    @orders = Order.closed.includes(:supplier).reorder(sort).page(params[:page]).per(@per_page)
  end

  # Gives a view for the results to a specific order
  # Renders also the pdf
  def show
    @order = Order.find(params[:id])
    @view = (params[:view] || 'default').gsub(/[^-_a-zA-Z0-9]/, '')
    @partial = case @view
               when 'default'  then 'articles'
               when 'groups'   then 'shared/articles_by/groups'
               when 'articles' then 'shared/articles_by/articles'
               else 'articles'
               end

    respond_to do |format|
      format.html
      format.js do
        render :layout => false
      end
      format.pdf do
        send_order_pdf @order, params[:document]
      end
      format.csv do
        send_data OrderCsv.new(@order).to_csv, filename: @order.name + '.csv', type: 'text/csv'
      end
      format.text do
        send_data OrderTxt.new(@order).to_txt, filename: @order.name + '.txt', type: 'text/plain'
      end
    end
  end

  # Page to create a new order.
  def new
    if params[:order_id]
      old_order = Order.find(params[:order_id])
      @order = Order.new(supplier_id: old_order.supplier_id).init_dates
      @order.article_ids = old_order.article_ids
    else
      @order = Order.new(supplier_id: params[:supplier_id]).init_dates
    end
  rescue => error
    redirect_to orders_url, alert: t('errors.general_msg', msg: error.message)
  end

  # Save a new order.
  # order_articles will be saved in Order.article_ids=()
  def create
    @order = Order.new(params[:order])
    @order.created_by = current_user
    @order.updated_by = current_user
    if @order.save
      flash[:notice] = I18n.t('orders.create.notice')
      redirect_to @order
    else
      logger.debug "[debug] order errors: #{@order.errors.messages}"
      render :action => 'new'
    end
  end

  # Page to edit an exsiting order.
  # editing finished orders is done in FinanceController
  def edit
    @order = Order.includes(:articles).find(params[:id])
  end

  # Update an existing order.
  def update
    @order = Order.find params[:id]
    if @order.update_attributes params[:order].merge(updated_by: current_user)
      flash[:notice] = I18n.t('orders.update.notice')
      redirect_to :action => 'show', :id => @order
    else
      render :action => 'edit'
    end
  end

  # Delete an order.
  def destroy
    Order.find(params[:id]).destroy
    redirect_to :action => 'index'
  end

  # Finish a current order.
  def finish
    order = Order.find(params[:id])
    order.finish!(@current_user)
    redirect_to order, notice: I18n.t('orders.finish.notice')
  rescue => error
    redirect_to orders_url, alert: I18n.t('errors.general_msg', :msg => error.message)
  end

  # Send a order to the supplier.
  def send_result_to_supplier
    order = Order.find(params[:id])
    order.send_to_supplier!(@current_user)
    redirect_to order, notice: I18n.t('orders.send_to_supplier.notice')
  rescue => error
    redirect_to order, alert: I18n.t('errors.general_msg', :msg => error.message)
  end

  def receive
    @order = Order.find(params[:id])
    unless request.post?
      @order_articles = @order.order_articles.ordered_or_member.includes(:article).order('articles.order_number, articles.name')
    else
      Order.transaction do
        s = update_order_amounts
        @order.update_attribute(:state, 'received') if @order.state != 'received'

        flash[:notice] = (s ? I18n.t('orders.receive.notice', :msg => s) : I18n.t('orders.receive.notice_none'))
      end
      NotifyReceivedOrderJob.perform_later(@order)
      if current_user.role_orders? || current_user.role_finance?
        redirect_to @order
      elsif current_user.role_pickups?
        redirect_to pickups_path
      else
        redirect_to receive_order_path(@order)
      end
    end
  end

  def receive_on_order_article_create # See publish/subscribe design pattern in /doc.
    @order_article = OrderArticle.find(params[:order_article_id])
    render :layout => false
  end

  def receive_on_order_article_update # See publish/subscribe design pattern in /doc.
    @order_article = OrderArticle.find(params[:order_article_id])
    render :layout => false
  end



  def remove_empty_article
    params[:order][:article_ids].reject!(&:blank?) if params[:order] && params[:order][:article_ids]
  end
end

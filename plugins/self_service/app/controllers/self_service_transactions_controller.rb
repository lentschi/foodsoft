class SelfServiceTransactionsController < Finance::FinancialTransactionsController
  before_action :ensure_enabled
  before_action :ensure_member_of_ordergroup

  def create
    @financial_transaction = FinancialTransaction.new(params[:financial_transaction])
    @financial_transaction.user = current_user
    if @financial_transaction.ordergroup
      @financial_transaction = @financial_transaction.add_transaction!
    else
      @financial_transaction.save!
    end
  rescue ActiveRecord::RecordInvalid => e
    @error = e
  end

  protected

  def ensure_member_of_ordergroup
    @ordergroup = Ordergroup.include_transaction_class_sum.find(params[:financial_transaction][:ordergroup_id])
    redirect_to root_url, alert: I18n.t('group_orders.errors.no_member') unless @ordergroup.member?(current_user)
  end

  def ensure_enabled
    redirect_to root_url, alert: I18n.t('self_service.access_denied') unless FoodsoftSelfService.enabled?
  end
end

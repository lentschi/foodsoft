class SelfServiceTransactionsController < Finance::FinancialTransactionsController
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
    @ordergroup.member?(current_user)
  end
end

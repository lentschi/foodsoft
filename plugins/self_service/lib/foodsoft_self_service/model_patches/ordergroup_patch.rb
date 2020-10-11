module FoodsoftSelfService
  module OrdergroupPatch
    def self.included(base)
      base.class_eval do
        def add_financial_transaction!(amount, note, user, transaction_type, link = nil, group_order = nil)
          t = nil
          transaction do
            t = FinancialTransaction.new(ordergroup: self, amount: amount, note: note, user: user, financial_transaction_type: transaction_type, financial_link: link, group_order: group_order)
            t.save!
            update_balance!
            # Notify only when order group had a positive balance before the last transaction:
            if t.amount < 0 && self.account_balance < 0 && self.account_balance - t.amount >= 0
              Resque.enqueue(UserNotifier, FoodsoftConfig.scope, 'negative_balance', self.id, t.id)
            end
          end

          t
        end
      end
    end

    def self.install
      Ordergroup.send :include, self
    end
  end
end

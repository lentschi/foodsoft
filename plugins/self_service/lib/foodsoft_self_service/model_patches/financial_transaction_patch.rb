module FoodsoftSelfService
  module FinancialTransactionPatch
    def self.included(base)
      base.class_eval do
        # TODO: This is most likely a fix that should actually be fixed in master
        validates_numericality_of :amount, greater_than: -100_000,
          less_than: 100_000, other_than: 0
      end
    end

    def self.install
      FinancialTransaction.send :include, self
    end
  end
end

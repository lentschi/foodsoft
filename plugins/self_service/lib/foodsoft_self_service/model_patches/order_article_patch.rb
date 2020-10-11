module FoodsoftSelfService
  module OrderArticlePatch
    def self.included(base)
      base.class_eval do
        def group_order_articles_with_fetch_deviations
          group_order_articles.filter { |goa| !goa.fetch_deviation.zero? }
        end

        def difference_received_ordered
          units_received - units_to_order
        end

        def sum_of_all_fetch_deviations
          group_order_articles.reduce(0) do |sum, goa|
            sum + goa.fetch_deviation
          end
        end

        def availability
          difference_received_ordered - sum_of_all_fetch_deviations
        end
      end
    end

    def self.install
      OrderArticle.send :include, self
    end
  end
end

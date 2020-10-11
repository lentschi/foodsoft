module FoodsoftSelfService
  module GroupOrderArticlePatch
    def self.included(base)
      base.class_eval do
        def fetch_deviation
          (quantity - result) * -1
        end
      end
    end

    def self.install
      GroupOrderArticle.send :include, self
    end
  end
end

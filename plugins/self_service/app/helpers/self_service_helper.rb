module SelfServiceHelper
  def order_articles_for_select2(order_articles, exclude_ids = [])
    order_articles = order_articles.joins(:article).reorder('articles.name ASC')
    order_articles.select { |a| exclude_ids.index(a.id).nil? } if exclude_ids
  end

  def self_service_article_edit_result(goa)
    result = number_with_precision goa.result, strip_insignificant_zeros: true
    simple_form_for goa, url: self_service_article_path(goa), remote: true, html: { 'data-submit-onchange' => 'changed', class: 'delta-input' } do |f|
      f.input_field :result, as: :delta, class: 'input-nano', data: { min: 0 }, id: "r_#{goa.id}", value: result
    end
  end
end
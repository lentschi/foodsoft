module GroupOrderArticlesHelper
  # return an edit field for a GroupOrderArticle result
  def group_order_article_edit_result(goa)
    result = number_with_precision goa.result, strip_insignificant_zeros: true
    if can_be_edited_in_place?(goa)
      return simple_form_for goa, remote: true, html: { 'data-submit-onchange' => 'changed', class: 'delta-input' } do |f|
        f.input_field :result, as: :delta, class: 'input-nano', data: { min: 0 }, id: "r_#{goa.id}", value: result
      end
    end

    result
  end

  private

  def can_be_edited_in_place?(goa)
    goa.group_order.order.finished? && (
      current_user.role_finance? ||
      (current_user.role_self_service? && goa.group_order.ordergroup.member?(current_user))
    )
  end
end

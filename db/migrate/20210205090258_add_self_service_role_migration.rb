# Add role for the new self service feature
# (see https://github.com/foodcoops/foodsoft/issues/766)
class AddSelfServiceRoleMigration < ActiveRecord::Migration[5.2]
  def change
    add_column :groups, :role_self_service, :boolean, default: false, null: false
  end
end

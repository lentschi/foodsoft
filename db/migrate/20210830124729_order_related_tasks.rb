class OrderRelatedTasks < ActiveRecord::Migration[5.2]
  def change
    add_column :orders, :task_id, :integer
    add_index :orders, :task_id, unique: true
    add_foreign_key :orders, :tasks

    add_column :tasks, :responsible_user_id, :integer
    add_index :tasks, :responsible_user_id
    add_foreign_key :tasks, :users, column: :responsible_user_id
  end
end

class CreateOrderRepetitionSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :order_repetition_settings, id: :integer do |t|
      t.date :starts_at
      t.integer :frequency
      t.integer :pickup_offset
    end

    add_column :suppliers, :order_repetition_setting_id, :integer
    add_index :suppliers, :order_repetition_setting_id, unique: true
    add_foreign_key :suppliers, :order_repetition_settings
  end
end

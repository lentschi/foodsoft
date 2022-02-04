class CreateWebpushNotificationEndpoints < ActiveRecord::Migration[5.2]
  def change
    create_table :webpush_notification_endpoints do |t|
      t.string :url, index: true
      t.string :p256dh_key, index: true
      t.string :auth_key, index: true
      t.integer :user_id, index: true
    end

    add_foreign_key :webpush_notification_endpoints, :users
  end
end

class CreateNotifications < ActiveRecord::Migration[7.2]
  def change
    create_table :notifications do |t|
      t.bigint :user_id, null: false
      t.string :title, null: false
      t.string :message, null: false
      t.string :notification_type, default: 'info'
      t.boolean :read, default: false
      t.jsonb :data, default: {}
      t.timestamps
    end
    add_index :notifications, :user_id
    add_index :notifications, [:user_id, :read]
    add_foreign_key :notifications, :users
  end
end

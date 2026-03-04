class CreateEquipments < ActiveRecord::Migration[7.2]
  def change
    create_table :equipments do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name, null: false
      t.string :equipment_type
      t.date :usage_date
      t.decimal :hours_used, precision: 8, scale: 2
      t.decimal :daily_rate, precision: 10, scale: 2
      t.decimal :total_cost, precision: 10, scale: 2
      t.string :operator_name
      t.text :notes
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
  end
end

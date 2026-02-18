class CreateWorkers < ActiveRecord::Migration[7.2]
  def change
    create_table :workers do |t|
      t.string :name
      t.string :phone
      t.string :role
      t.decimal :daily_wage
      t.references :project, null: false, foreign_key: true
      t.boolean :is_active
      t.date :joined_date

      t.timestamps
    end
  end
end

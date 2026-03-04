class CreateSubcontractors < ActiveRecord::Migration[7.2]
  def change
    create_table :subcontractors do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name, null: false
      t.string :specialty
      t.decimal :contract_amount, precision: 10, scale: 2, default: 0
      t.decimal :paid_amount, precision: 10, scale: 2, default: 0
      t.string :phone
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

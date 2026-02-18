class CreateMaterials < ActiveRecord::Migration[7.2]
  def change
    create_table :materials do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name
      t.decimal :quantity
      t.string :unit
      t.decimal :cost
      t.decimal :total_cost
      t.string :supplier
      t.date :purchase_date
      t.string :invoice_number
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

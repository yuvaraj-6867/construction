class CreateExpenses < ActiveRecord::Migration[7.2]
  def change
    create_table :expenses do |t|
      t.references :project, null: false, foreign_key: true
      t.string :category
      t.string :description
      t.decimal :amount
      t.date :date
      t.string :bill_number
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

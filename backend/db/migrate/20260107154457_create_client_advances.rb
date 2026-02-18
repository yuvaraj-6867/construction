class CreateClientAdvances < ActiveRecord::Migration[7.2]
  def change
    create_table :client_advances do |t|
      t.references :project, null: false, foreign_key: true
      t.decimal :amount
      t.date :date
      t.string :payment_method
      t.string :reference_number
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

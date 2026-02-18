class CreatePayments < ActiveRecord::Migration[7.2]
  def change
    create_table :payments do |t|
      t.references :worker, null: false, foreign_key: true
      t.references :project, null: false, foreign_key: true
      t.decimal :amount
      t.date :date
      t.string :payment_type
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

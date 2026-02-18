class CreateInvoices < ActiveRecord::Migration[7.2]
  def change
    create_table :invoices do |t|
      t.references :project, null: false, foreign_key: true
      t.string :invoice_number
      t.decimal :amount
      t.date :date
      t.date :due_date
      t.string :status
      t.jsonb :items
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

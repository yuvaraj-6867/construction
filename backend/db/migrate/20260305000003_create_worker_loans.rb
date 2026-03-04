class CreateWorkerLoans < ActiveRecord::Migration[7.2]
  def change
    create_table :worker_loans do |t|
      t.references :worker, null: false, foreign_key: true
      t.references :project, null: false, foreign_key: true
      t.decimal :loan_amount, precision: 10, scale: 2, null: false
      t.decimal :repaid_amount, precision: 10, scale: 2, default: 0
      t.date :loan_date, null: false
      t.string :purpose
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

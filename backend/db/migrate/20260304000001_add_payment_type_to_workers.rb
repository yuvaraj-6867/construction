class AddPaymentTypeToWorkers < ActiveRecord::Migration[7.2]
  def change
    add_column :workers, :payment_type, :string, default: 'daily'
    add_column :workers, :contract_amount, :decimal, precision: 10, scale: 2
  end
end

class AddPaymentMethodToPayments < ActiveRecord::Migration[7.2]
  def change
    add_column :payments, :payment_method, :string, default: 'cash' unless column_exists?(:payments, :payment_method)
    add_column :payments, :payment_date, :date unless column_exists?(:payments, :payment_date)
  end
end

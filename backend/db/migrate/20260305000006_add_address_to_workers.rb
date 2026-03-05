class AddAddressToWorkers < ActiveRecord::Migration[7.2]
  def change
    add_column :workers, :address, :string
  end
end

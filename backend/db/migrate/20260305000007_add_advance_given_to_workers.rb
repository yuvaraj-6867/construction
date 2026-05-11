class AddAdvanceGivenToWorkers < ActiveRecord::Migration[7.2]
  def change
    add_column :workers, :advance_given, :decimal, precision: 10, scale: 2, default: 0
  end
end

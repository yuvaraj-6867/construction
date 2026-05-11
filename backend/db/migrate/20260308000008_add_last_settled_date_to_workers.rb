class AddLastSettledDateToWorkers < ActiveRecord::Migration[7.2]
  def change
    add_column :workers, :last_settled_date, :date
  end
end

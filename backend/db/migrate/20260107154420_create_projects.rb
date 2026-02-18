class CreateProjects < ActiveRecord::Migration[7.2]
  def change
    create_table :projects do |t|
      t.string :name
      t.string :client_name
      t.string :location
      t.decimal :budget
      t.date :start_date
      t.date :end_date
      t.string :status
      t.text :description
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

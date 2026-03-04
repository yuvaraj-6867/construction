class CreateWorkDiaries < ActiveRecord::Migration[7.2]
  def change
    create_table :work_diaries do |t|
      t.references :project, null: false, foreign_key: true
      t.date :date, null: false
      t.string :title
      t.text :description
      t.string :weather
      t.integer :workers_present_count, default: 0
      t.text :work_done
      t.text :issues
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :work_diaries, [:project_id, :date], unique: true
  end
end

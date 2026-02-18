class CreateAttendances < ActiveRecord::Migration[7.2]
  def change
    create_table :attendances do |t|
      t.references :worker, null: false, foreign_key: true
      t.references :project, null: false, foreign_key: true
      t.date :date
      t.string :status
      t.decimal :wage
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

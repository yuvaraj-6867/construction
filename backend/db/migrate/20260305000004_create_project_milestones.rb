class CreateProjectMilestones < ActiveRecord::Migration[7.2]
  def change
    create_table :project_milestones do |t|
      t.references :project, null: false, foreign_key: true
      t.string :title, null: false
      t.date :target_date
      t.boolean :completed, default: false
      t.integer :completion_pct, default: 0
      t.text :notes
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

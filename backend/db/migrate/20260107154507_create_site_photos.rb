class CreateSitePhotos < ActiveRecord::Migration[7.2]
  def change
    create_table :site_photos do |t|
      t.references :project, null: false, foreign_key: true
      t.string :url
      t.text :caption
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

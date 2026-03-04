class WorkDiary < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :project_id, presence: true
  validates :date, presence: true
  validates :date, uniqueness: { scope: :project_id, message: 'already has a diary entry for this date' }
end

class ProjectMilestone < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :title, presence: true
  validates :completion_pct, inclusion: { in: 0..100 }
end

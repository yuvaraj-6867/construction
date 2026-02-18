class Attendance < ApplicationRecord
  belongs_to :worker
  belongs_to :project
  belongs_to :user

  # Validations
  validates :date, presence: true
  validates :status, presence: true, inclusion: { in: %w[present half-day absent] }
  validates :worker_id, presence: true
  validates :project_id, presence: true

  # Callbacks
  before_save :calculate_wage

  private

  def calculate_wage
    return unless worker && status

    case status
    when 'present'
      self.wage = worker.daily_wage
    when 'half-day'
      self.wage = worker.daily_wage * 0.5
    when 'absent'
      self.wage = 0
    end
  end
end

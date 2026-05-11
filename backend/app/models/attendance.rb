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
    rate = worker.payment_type == "contract" ? (worker.contract_amount || 0) : (worker.daily_wage || 0)
    case status
    when "present"  then self.wage = rate
    when "half-day" then self.wage = rate * 0.5
    when "absent"   then self.wage = 0
    end
  end
end

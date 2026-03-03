class Worker < ApplicationRecord
  belongs_to :project

  # Associations
  has_many :attendances, dependent: :destroy
  has_many :payments, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :phone, presence: true
  validates :role, presence: true
  validates :project_id, presence: true
  validates :payment_type, inclusion: { in: %w[daily contract] }
  validates :daily_wage, presence: true, numericality: { greater_than: 0 }, if: -> { payment_type == 'daily' }
  validates :contract_amount, numericality: { greater_than: 0 }, allow_nil: true, if: -> { payment_type == 'contract' }

  # Set default values
  after_initialize :set_defaults

  # Business Logic Methods
  def total_wages_earned
    if payment_type == 'contract'
      contract_amount || 0
    else
      attendances.sum(:wage) || 0
    end
  end

  def total_advances
    payments.where(payment_type: 'advance').sum(:amount) || 0
  end

  def total_payments
    payments.where(payment_type: 'wage').sum(:amount) || 0
  end

  def balance_due
    total_wages_earned - total_advances - total_payments
  end

  private

  def set_defaults
    self.is_active = true if is_active.nil?
    self.joined_date = Date.current if joined_date.nil?
    self.payment_type ||= 'daily'
  end
end

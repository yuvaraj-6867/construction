class Project < ApplicationRecord
  belongs_to :user

  # Associations
  has_many :workers, dependent: :destroy
  has_many :attendances, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :materials, dependent: :destroy
  has_many :expenses, dependent: :destroy
  has_many :client_advances, dependent: :destroy
  has_many :invoices, dependent: :destroy
  has_many :site_photos, dependent: :destroy

  # Validations
  validates :name, presence: true
  validates :client_name, presence: true
  validates :location, presence: true
  validates :budget, presence: true, numericality: { greater_than: 0 }
  validates :start_date, presence: true
  validates :status, presence: true, inclusion: { in: %w[planning in-progress completed on-hold] }

  # Business Logic Methods
  def total_labor_cost
    attendances.sum(:wage) || 0
  end

  def total_material_cost
    materials.sum(:total_cost) || 0
  end

  def total_expenses
    expenses.sum(:amount) || 0
  end

  def total_client_advance
    client_advances.sum(:amount) || 0
  end

  def total_cost
    total_labor_cost + total_material_cost + total_expenses
  end

  def profit_loss
    total_client_advance - total_cost
  end

  def active_workers_count
    workers.where(is_active: true).count
  end
end

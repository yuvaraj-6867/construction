class Equipment < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :name, presence: true
  validates :project_id, presence: true

  before_save :calculate_total_cost

  private

  def calculate_total_cost
    if daily_rate.present? && hours_used.present?
      self.total_cost = (daily_rate * hours_used / 8.0).round(2)
    end
  end
end

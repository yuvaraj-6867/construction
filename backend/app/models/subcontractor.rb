class Subcontractor < ApplicationRecord
  belongs_to :project
  belongs_to :user

  validates :name, presence: true

  def balance_due
    (contract_amount || 0) - (paid_amount || 0)
  end
end

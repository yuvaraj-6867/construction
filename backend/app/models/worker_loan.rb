class WorkerLoan < ApplicationRecord
  belongs_to :worker
  belongs_to :project
  belongs_to :user

  validates :loan_amount, presence: true, numericality: { greater_than: 0 }
  validates :loan_date, presence: true

  def balance
    loan_amount - (repaid_amount || 0)
  end
end

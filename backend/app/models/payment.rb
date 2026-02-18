class Payment < ApplicationRecord
  belongs_to :worker
  belongs_to :project
  belongs_to :user
end

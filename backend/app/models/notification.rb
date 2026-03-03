class Notification < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :message, presence: true
  validates :notification_type, inclusion: { in: %w[info success warning payment attendance] }

  scope :unread, -> { where(read: false) }
  scope :recent, -> { order(created_at: :desc).limit(20) }

  def self.create_for_payment(user, payment, worker)
    create!(
      user: user,
      title: 'Payment Recorded',
      message: "₹#{payment.amount} #{payment.payment_type} payment recorded for #{worker.name}",
      notification_type: 'payment',
      data: { payment_id: payment.id, worker_id: worker.id, amount: payment.amount }
    )
  end

  def self.create_for_attendance(user, count, date)
    create!(
      user: user,
      title: 'Attendance Marked',
      message: "Attendance marked for #{count} workers on #{date}",
      notification_type: 'attendance',
      data: { count: count, date: date }
    )
  end
end

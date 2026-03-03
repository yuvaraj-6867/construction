class PaymentMailer < ApplicationMailer
  def payment_confirmation(user, payment, worker)
    @user = user
    @payment = payment
    @worker = worker
    @balance = worker.balance_due

    mail(
      to: user.email,
      subject: "Payment Recorded - #{worker.name} (₹#{payment.amount})"
    ) do |format|
      format.text do
        render plain: <<~TEXT
          Hi #{user.name},

          A payment has been recorded:

          Worker: #{worker.name}
          Amount: ₹#{payment.amount}
          Type: #{payment.payment_type}
          Date: #{payment.date}
          Remaining Balance: ₹#{@balance}

          - Construction Management App
        TEXT
      end
    end
  end
end

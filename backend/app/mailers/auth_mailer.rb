class AuthMailer < ApplicationMailer
  def reset_password(user, token)
    @user = user
    @token = token
    @reset_url = "http://localhost:3000/reset-password?token=#{token}"

    mail(to: user.email, subject: 'Password Reset - Construction App') do |format|
      format.text do
        render plain: <<~TEXT
          Hi #{user.name},

          You requested a password reset. Use the token below:

          Token: #{token}

          Or visit: #{@reset_url}

          This link expires in 2 hours.

          If you didn't request this, ignore this email.

          - Construction Management App
        TEXT
      end
    end
  end
end

class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, raise: false

  # POST /api/v1/auth/register
  def register
    user = User.new(user_params)

    if user.save
      token = encode_token(user_id: user.id)
      render json: { token: token, user: user_json(user) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/auth/login
  def login
    user = if params[:email]&.match?(/^[0-9]{10}$/)
             User.find_by(phone: params[:email])
           else
             User.find_by(email: params[:email])
           end

    if user && user.authenticate(params[:password])
      token = encode_token(user_id: user.id, exp: 24.hours.from_now.to_i)
      render json: { token: token, user: user_json(user), expires_at: 24.hours.from_now.iso8601 }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  # GET /api/v1/auth/me
  def me
    if current_user
      render json: { user: user_json(current_user) }, status: :ok
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  # POST /api/v1/auth/forgot_password
  def forgot_password
    user = User.find_by(email: params[:email])
    if user
      token = SecureRandom.urlsafe_base64(32)
      user.update!(
        reset_password_token: token,
        reset_password_sent_at: Time.current
      )
      # Send reset email
      AuthMailer.reset_password(user, token).deliver_later rescue nil
      render json: { message: 'Password reset instructions sent to your email' }
    else
      render json: { error: 'Email not found' }, status: :not_found
    end
  end

  # POST /api/v1/auth/reset_password
  def reset_password
    user = User.find_by(reset_password_token: params[:token])

    if user.nil?
      return render json: { error: 'Invalid or expired token' }, status: :unprocessable_entity
    end

    if user.reset_password_sent_at < 2.hours.ago
      return render json: { error: 'Token expired. Please request a new one.' }, status: :unprocessable_entity
    end

    if user.update(password: params[:password], password_confirmation: params[:password_confirmation],
                   reset_password_token: nil, reset_password_sent_at: nil)
      render json: { message: 'Password reset successfully. You can now login.' }
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :role, :phone)
  end

  def user_json(user)
    { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone }
  end

  def encode_token(payload)
    JWT.encode(payload, Rails.application.secret_key_base)
  end

  def current_user
    return nil unless request.headers['Authorization']
    token = request.headers['Authorization'].split(' ')[1]
    decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
    User.find_by(id: decoded[0]['user_id'])
  rescue JWT::DecodeError
    nil
  end
end

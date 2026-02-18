class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, raise: false

  # POST /api/v1/auth/register
  def register
    user = User.new(user_params)

    if user.save
      token = encode_token(user_id: user.id)
      render json: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/auth/login
  def login
    # Check if input is email or phone number
    user = if params[:email].match?(/^[0-9]{10}$/)
             # It's a phone number
             User.find_by(phone: params[:email])
           else
             # It's an email
             User.find_by(email: params[:email])
           end

    if user && user.authenticate(params[:password])
      token = encode_token(user_id: user.id)
      render json: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  # GET /api/v1/auth/me
  def me
    if current_user
      render json: {
        user: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name,
          role: current_user.role
        }
      }, status: :ok
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :role, :phone)
  end

  def encode_token(payload)
    JWT.encode(payload, Rails.application.secret_key_base)
  end

  def current_user
    if request.headers['Authorization']
      token = request.headers['Authorization'].split(' ')[1]
      begin
        decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
        user_id = decoded_token[0]['user_id']
        @current_user = User.find_by(id: user_id)
      rescue JWT::DecodeError
        nil
      end
    end
  end
end

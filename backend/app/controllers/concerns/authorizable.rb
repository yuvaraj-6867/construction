# app/controllers/concerns/authorizable.rb
module Authorizable
  extend ActiveSupport::Concern

  included do
    rescue_from NotAuthorizedError, with: :render_unauthorized
  end

  class NotAuthorizedError < StandardError; end

  # Check if current user has permission
  def authorize!(permission)
    unless current_user&.has_permission?(permission)
      raise NotAuthorizedError, "You don't have permission to perform this action"
    end
  end

  # Check if current user has any of the permissions
  def authorize_any!(*permissions)
    unless current_user&.has_any_permission?(*permissions)
      raise NotAuthorizedError, "You don't have permission to perform this action"
    end
  end

  # Check if current user has all permissions
  def authorize_all!(*permissions)
    unless current_user&.has_all_permissions?(*permissions)
      raise NotAuthorizedError, "You don't have permission to perform this action"
    end
  end

  # Check if current user is admin
  def require_admin!
    unless current_user&.admin?
      raise NotAuthorizedError, "Admin access required"
    end
  end

  private

  def render_unauthorized(exception)
    render json: {
      error: exception.message,
      status: 'forbidden'
    }, status: :forbidden
  end
end

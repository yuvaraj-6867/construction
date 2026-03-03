class User < ApplicationRecord
  include RolePermissions

  has_secure_password

  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }
  validate :password_complexity, if: -> { new_record? || !password.nil? }

  private

  def password_complexity
    return if password.blank?

    unless password.match?(/[A-Z]/)
      errors.add :password, 'must include at least one uppercase letter'
    end

    unless password.match?(/[0-9]/)
      errors.add :password, 'must include at least one number'
    end

    unless password.match?(/[@$!%*?&#]/)
      errors.add :password, 'must include at least one special character (@$!%*?&#)'
    end
  end

  public

  # Associations
  has_many :projects, dependent: :destroy
  has_many :attendances, dependent: :nullify
  has_many :payments, dependent: :nullify
  has_many :materials, dependent: :nullify
  has_many :expenses, dependent: :nullify
  has_many :client_advances, dependent: :nullify
  has_many :invoices, dependent: :nullify
  has_many :site_photos, dependent: :nullify
  has_many :notifications, dependent: :destroy
end

# app/models/concerns/role_permissions.rb
module RolePermissions
  extend ActiveSupport::Concern

  ROLES = {
    admin: 'admin',
    manager: 'manager',
    supervisor: 'supervisor',
    accountant: 'accountant',
    viewer: 'viewer'
  }.freeze

  PERMISSIONS = {
    # Project Permissions
    view_projects: 'view_projects',
    create_project: 'create_project',
    edit_project: 'edit_project',
    delete_project: 'delete_project',

    # Worker Permissions
    view_workers: 'view_workers',
    create_worker: 'create_worker',
    edit_worker: 'edit_worker',
    delete_worker: 'delete_worker',

    # Attendance Permissions
    view_attendance: 'view_attendance',
    mark_attendance: 'mark_attendance',
    edit_attendance: 'edit_attendance',

    # Payment Permissions
    view_payments: 'view_payments',
    create_payment: 'create_payment',
    edit_payment: 'edit_payment',
    delete_payment: 'delete_payment',

    # Material Permissions
    view_materials: 'view_materials',
    create_material: 'create_material',
    edit_material: 'edit_material',
    delete_material: 'delete_material',

    # Expense Permissions
    view_expenses: 'view_expenses',
    create_expense: 'create_expense',
    edit_expense: 'edit_expense',
    delete_expense: 'delete_expense',

    # Client Advance Permissions
    view_client_advances: 'view_client_advances',
    create_client_advance: 'create_client_advance',
    edit_client_advance: 'edit_client_advance',
    delete_client_advance: 'delete_client_advance',

    # Invoice Permissions
    view_invoices: 'view_invoices',
    create_invoice: 'create_invoice',
    edit_invoice: 'edit_invoice',
    delete_invoice: 'delete_invoice',

    # Settings Permissions
    view_settings: 'view_settings',
    manage_users: 'manage_users',
    manage_roles: 'manage_roles'
  }.freeze

  ROLE_PERMISSIONS = {
    admin: [
      # Admin has all permissions
      :view_projects, :create_project, :edit_project, :delete_project,
      :view_workers, :create_worker, :edit_worker, :delete_worker,
      :view_attendance, :mark_attendance, :edit_attendance,
      :view_payments, :create_payment, :edit_payment, :delete_payment,
      :view_materials, :create_material, :edit_material, :delete_material,
      :view_expenses, :create_expense, :edit_expense, :delete_expense,
      :view_client_advances, :create_client_advance, :edit_client_advance, :delete_client_advance,
      :view_invoices, :create_invoice, :edit_invoice, :delete_invoice,
      :view_settings, :manage_users, :manage_roles
    ],

    manager: [
      # Manager can do most things except delete and manage users
      :view_projects, :create_project, :edit_project,
      :view_workers, :create_worker, :edit_worker,
      :view_attendance, :mark_attendance, :edit_attendance,
      :view_payments, :create_payment, :edit_payment,
      :view_materials, :create_material, :edit_material,
      :view_expenses, :create_expense, :edit_expense,
      :view_client_advances, :create_client_advance, :edit_client_advance,
      :view_invoices, :create_invoice, :edit_invoice,
      :view_settings
    ],

    supervisor: [
      # Supervisor focuses on workers and attendance
      :view_projects,
      :view_workers, :create_worker, :edit_worker,
      :view_attendance, :mark_attendance, :edit_attendance,
      :view_materials, :create_material,
      :view_expenses,
      :view_settings
    ],

    accountant: [
      # Accountant focuses on financial operations
      :view_projects,
      :view_workers,
      :view_attendance,
      :view_payments, :create_payment, :edit_payment,
      :view_materials,
      :view_expenses, :create_expense, :edit_expense,
      :view_client_advances, :create_client_advance, :edit_client_advance,
      :view_invoices, :create_invoice, :edit_invoice,
      :view_settings
    ],

    viewer: [
      # Viewer can only view, no modifications
      :view_projects, :view_workers, :view_attendance,
      :view_payments, :view_materials, :view_expenses,
      :view_client_advances, :view_invoices, :view_settings
    ]
  }.freeze

  included do
    # Validate role on user model
    validates :role, inclusion: { in: ROLES.values }, allow_blank: false
  end

  class_methods do
    def valid_roles
      ROLES.values
    end

    def permissions_for_role(role)
      ROLE_PERMISSIONS[role.to_sym] || []
    end
  end

  # Instance methods
  def has_permission?(permission)
    return false unless role.present?

    role_permissions = ROLE_PERMISSIONS[role.to_sym] || []
    role_permissions.include?(permission.to_sym)
  end

  def has_any_permission?(*permissions)
    permissions.any? { |permission| has_permission?(permission) }
  end

  def has_all_permissions?(*permissions)
    permissions.all? { |permission| has_permission?(permission) }
  end

  def permissions
    ROLE_PERMISSIONS[role.to_sym] || []
  end

  def admin?
    role == 'admin'
  end

  def manager?
    role == 'manager'
  end

  def supervisor?
    role == 'supervisor'
  end

  def accountant?
    role == 'accountant'
  end

  def viewer?
    role == 'viewer'
  end
end

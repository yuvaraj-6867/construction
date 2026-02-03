// Role-based Access Control Permissions

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  ACCOUNTANT = 'accountant',
  VIEWER = 'viewer'
}

export enum Permission {
  // Project Permissions
  VIEW_PROJECTS = 'view_projects',
  CREATE_PROJECT = 'create_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',

  // Worker Permissions
  VIEW_WORKERS = 'view_workers',
  CREATE_WORKER = 'create_worker',
  EDIT_WORKER = 'edit_worker',
  DELETE_WORKER = 'delete_worker',

  // Attendance Permissions
  VIEW_ATTENDANCE = 'view_attendance',
  MARK_ATTENDANCE = 'mark_attendance',
  EDIT_ATTENDANCE = 'edit_attendance',

  // Payment Permissions
  VIEW_PAYMENTS = 'view_payments',
  CREATE_PAYMENT = 'create_payment',
  EDIT_PAYMENT = 'edit_payment',
  DELETE_PAYMENT = 'delete_payment',

  // Material Permissions
  VIEW_MATERIALS = 'view_materials',
  CREATE_MATERIAL = 'create_material',
  EDIT_MATERIAL = 'edit_material',
  DELETE_MATERIAL = 'delete_material',

  // Expense Permissions
  VIEW_EXPENSES = 'view_expenses',
  CREATE_EXPENSE = 'create_expense',
  EDIT_EXPENSE = 'edit_expense',
  DELETE_EXPENSE = 'delete_expense',

  // Client Advance Permissions
  VIEW_CLIENT_ADVANCES = 'view_client_advances',
  CREATE_CLIENT_ADVANCE = 'create_client_advance',
  EDIT_CLIENT_ADVANCE = 'edit_client_advance',
  DELETE_CLIENT_ADVANCE = 'delete_client_advance',

  // Invoice Permissions
  VIEW_INVOICES = 'view_invoices',
  CREATE_INVOICE = 'create_invoice',
  EDIT_INVOICE = 'edit_invoice',
  DELETE_INVOICE = 'delete_invoice',

  // Settings Permissions
  VIEW_SETTINGS = 'view_settings',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
}

// Role-based permission mapping
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.DELETE_PROJECT,

    Permission.VIEW_WORKERS,
    Permission.CREATE_WORKER,
    Permission.EDIT_WORKER,
    Permission.DELETE_WORKER,

    Permission.VIEW_ATTENDANCE,
    Permission.MARK_ATTENDANCE,
    Permission.EDIT_ATTENDANCE,

    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.EDIT_PAYMENT,
    Permission.DELETE_PAYMENT,

    Permission.VIEW_MATERIALS,
    Permission.CREATE_MATERIAL,
    Permission.EDIT_MATERIAL,
    Permission.DELETE_MATERIAL,

    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    Permission.EDIT_EXPENSE,
    Permission.DELETE_EXPENSE,

    Permission.VIEW_CLIENT_ADVANCES,
    Permission.CREATE_CLIENT_ADVANCE,
    Permission.EDIT_CLIENT_ADVANCE,
    Permission.DELETE_CLIENT_ADVANCE,

    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.EDIT_INVOICE,
    Permission.DELETE_INVOICE,

    Permission.VIEW_SETTINGS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
  ],

  [Role.MANAGER]: [
    // Manager can do most things except delete and manage users
    Permission.VIEW_PROJECTS,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,

    Permission.VIEW_WORKERS,
    Permission.CREATE_WORKER,
    Permission.EDIT_WORKER,

    Permission.VIEW_ATTENDANCE,
    Permission.MARK_ATTENDANCE,
    Permission.EDIT_ATTENDANCE,

    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.EDIT_PAYMENT,

    Permission.VIEW_MATERIALS,
    Permission.CREATE_MATERIAL,
    Permission.EDIT_MATERIAL,

    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    Permission.EDIT_EXPENSE,

    Permission.VIEW_CLIENT_ADVANCES,
    Permission.CREATE_CLIENT_ADVANCE,
    Permission.EDIT_CLIENT_ADVANCE,

    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.EDIT_INVOICE,

    Permission.VIEW_SETTINGS,
  ],

  [Role.SUPERVISOR]: [
    // Supervisor focuses on workers and attendance
    Permission.VIEW_PROJECTS,

    Permission.VIEW_WORKERS,
    Permission.CREATE_WORKER,
    Permission.EDIT_WORKER,

    Permission.VIEW_ATTENDANCE,
    Permission.MARK_ATTENDANCE,
    Permission.EDIT_ATTENDANCE,

    Permission.VIEW_MATERIALS,
    Permission.CREATE_MATERIAL,

    Permission.VIEW_EXPENSES,

    Permission.VIEW_SETTINGS,
  ],

  [Role.ACCOUNTANT]: [
    // Accountant focuses on financial operations
    Permission.VIEW_PROJECTS,

    Permission.VIEW_WORKERS,

    Permission.VIEW_ATTENDANCE,

    Permission.VIEW_PAYMENTS,
    Permission.CREATE_PAYMENT,
    Permission.EDIT_PAYMENT,

    Permission.VIEW_MATERIALS,

    Permission.VIEW_EXPENSES,
    Permission.CREATE_EXPENSE,
    Permission.EDIT_EXPENSE,

    Permission.VIEW_CLIENT_ADVANCES,
    Permission.CREATE_CLIENT_ADVANCE,
    Permission.EDIT_CLIENT_ADVANCE,

    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.EDIT_INVOICE,

    Permission.VIEW_SETTINGS,
  ],

  [Role.VIEWER]: [
    // Viewer can only view, no modifications
    Permission.VIEW_PROJECTS,
    Permission.VIEW_WORKERS,
    Permission.VIEW_ATTENDANCE,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_EXPENSES,
    Permission.VIEW_CLIENT_ADVANCES,
    Permission.VIEW_INVOICES,
    Permission.VIEW_SETTINGS,
  ],
};

// Check if user has permission
export const hasPermission = (userRole: string, permission: Permission): boolean => {
  const role = userRole.toLowerCase() as Role;
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
};

// Check if user has any of the permissions
export const hasAnyPermission = (userRole: string, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Check if user has all permissions
export const hasAllPermissions = (userRole: string, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Get all permissions for a role
export const getPermissions = (userRole: string): Permission[] => {
  const role = userRole.toLowerCase() as Role;
  return rolePermissions[role] || [];
};

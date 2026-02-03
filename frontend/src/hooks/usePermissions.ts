import { useEffect, useState } from 'react';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions, getPermissions } from '../utils/permissions';

export const usePermissions = () => {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
    }
  }, []);

  return {
    userRole,
    can: (permission: Permission) => hasPermission(userRole, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    permissions: getPermissions(userRole),
  };
};

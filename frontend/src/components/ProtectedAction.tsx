import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../utils/permissions';

interface ProtectedActionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { can } = usePermissions();

  if (can(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ProtectedActionAnyProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedActionAny: React.FC<ProtectedActionAnyProps> = ({
  permissions,
  children,
  fallback = null,
}) => {
  const { canAny } = usePermissions();

  if (canAny(permissions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ProtectedActionAllProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedActionAll: React.FC<ProtectedActionAllProps> = ({
  permissions,
  children,
  fallback = null,
}) => {
  const { canAll } = usePermissions();

  if (canAll(permissions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

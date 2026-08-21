import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppPermission } from '../constants/permissions.constants';
import { PermissionService } from '../services/permission.service';
import { PortalContextService } from '../services/portal-context.service';
import { PermissionMatchMode } from '../directives/has-permission.directive';

/**
 * Blocks a route unless the user holds the permissions declared on
 * `route.data.permissions`. Denied users are sent to their own portal
 * dashboard, which is never permission-guarded, so this cannot loop.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const portalContextService = inject(PortalContextService);
  const router = inject(Router);

  const requiredPermissions = (route.data['permissions'] ??
    []) as AppPermission[];
  const matchMode = (route.data['permissionsMode'] ??
    'any') as PermissionMatchMode;

  if (requiredPermissions.length === 0) {
    return true;
  }

  const allowed =
    matchMode === 'all'
      ? permissionService.hasAll(requiredPermissions)
      : permissionService.hasAny(requiredPermissions);

  if (allowed) {
    return true;
  }

  return router.parseUrl(portalContextService.getHomeDashboardRoute());
};

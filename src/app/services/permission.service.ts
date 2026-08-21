import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AppPermission,
  normalizePermission,
} from '../constants/permissions.constants';
import { SessionStateService } from './session-state.service';

const PERMISSIONS_STORAGE_KEY = 'PERMISSIONS';
const ROLES_STORAGE_KEY = 'ROLES';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly sessionStateService = inject(SessionStateService);

  private readonly permissions = signal<string[]>(
    this.readStoredList(PERMISSIONS_STORAGE_KEY),
  );
  private readonly roles = signal<string[]>(
    this.readStoredList(ROLES_STORAGE_KEY),
  );
  private readonly permissionLookup = computed(
    () => new Set(this.permissions().map(normalizePermission)),
  );

  readonly grantedPermissions = this.permissions.asReadonly();
  readonly grantedRoles = this.roles.asReadonly();

  constructor() {
    this.sessionStateService.registerResetHandler(() => this.clear());
  }

  setFromLogin(permissions?: string[] | null, roles?: string[] | null): void {
    const grantedPermissions = permissions ?? [];
    const grantedRoles = roles ?? [];

    sessionStorage.setItem(
      PERMISSIONS_STORAGE_KEY,
      JSON.stringify(grantedPermissions),
    );
    sessionStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(grantedRoles));

    this.permissions.set(grantedPermissions);
    this.roles.set(grantedRoles);
  }

  has(permission: AppPermission): boolean {
    return this.permissionLookup().has(normalizePermission(permission));
  }

  hasAny(permissions: AppPermission[]): boolean {
    if (permissions.length === 0) {
      return true;
    }
    return permissions.some((permission) => this.has(permission));
  }

  hasAll(permissions: AppPermission[]): boolean {
    return permissions.every((permission) => this.has(permission));
  }

  clear(): void {
    sessionStorage.removeItem(PERMISSIONS_STORAGE_KEY);
    sessionStorage.removeItem(ROLES_STORAGE_KEY);
    this.permissions.set([]);
    this.roles.set([]);
  }

  private readStoredList(storageKey: string): string[] {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === 'string')
        : [];
    } catch {
      return [];
    }
  }
}

/**
 * Registry of every permission the backend can return on the login payload.
 * Values must match the backend strings exactly; comparisons are
 * case-insensitive so the mixed casing the API uses ("Manage Departments"
 * vs "Manage locations") cannot cause a silent mismatch.
 */
export const APP_PERMISSIONS = {
  MANAGE_APPLICATION_FEES_MANUALLY: 'Manage Application Fees manually',
  MANAGE_APPLICANTS: 'Manage applicants',
  VIEW_APPLICANTS: 'View applicants',
  CREATE_UPDATE_APPLICATIONS: 'Create/Update applications',
  DELETE_APPLICATIONS: 'Delete applications',
  VIEW_APPLICATIONS: 'View applications',
  CREATE_ROLES: 'Create roles',
  DELETE_ROLES: 'Delete roles',
  UPDATE_ROLES: 'Update roles',
  VIEW_ROLES: 'View roles',
  MANAGE_DEPARTMENTS: 'Manage Departments',
  MANAGE_FEES: 'Manage Fees',
  MANAGE_LEVELS: 'Manage Levels',
  MANAGE_PROGRAMS: 'Manage Programs',
  MANAGE_LOCATIONS: 'Manage locations',
  MANAGE_SESSIONS: 'Manage sessions',
  ACTIVATE_USER_ACCOUNT: 'Activate user account',
  CHANGE_USER_PASSWORD: 'Change user password',
  CREATE_USERS: 'Create users',
  DELETE_USERS: 'Delete users',
  RESET_USER_PASSWORD: 'Reset user password',
  UPDATE_USERS: 'Update users',
  VIEW_USERS: 'View users',
  // Proposed for the Board/Provost portals — not yet issued by the backend.
  // Rename here if the backend settles on different strings.
  VIEW_PAYMENTS: 'View payments',
  VIEW_EXPENSES: 'View expenses',
  CREATE_EXPENSES: 'Create expenses',
} as const;

/** Any of these unlocks the read-only income history. */
export const INCOME_VIEW_PERMISSIONS: AppPermission[] = [
  APP_PERMISSIONS.VIEW_PAYMENTS,
  APP_PERMISSIONS.MANAGE_FEES,
  APP_PERMISSIONS.MANAGE_APPLICATION_FEES_MANUALLY,
];

export const EXPENSE_VIEW_PERMISSIONS: AppPermission[] = [
  APP_PERMISSIONS.VIEW_EXPENSES,
  APP_PERMISSIONS.CREATE_EXPENSES,
];

export const STAFF_VIEW_PERMISSIONS: AppPermission[] = [
  APP_PERMISSIONS.VIEW_USERS,
  APP_PERMISSIONS.CREATE_USERS,
  APP_PERMISSIONS.UPDATE_USERS,
];

export type AppPermission =
  (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS];

export const APP_PERMISSION_LIST: AppPermission[] =
  Object.values(APP_PERMISSIONS);

export function normalizePermission(permission: string): string {
  return permission.trim().toLowerCase();
}

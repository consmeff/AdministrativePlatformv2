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
} as const;

export type AppPermission =
  (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS];

export const APP_PERMISSION_LIST: AppPermission[] =
  Object.values(APP_PERMISSIONS);

export function normalizePermission(permission: string): string {
  return permission.trim().toLowerCase();
}

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type AcademicPortalRole =
  | 'admin'
  | 'lecturer'
  | 'hod'
  | 'board'
  | 'provost';

const USER_TYPE_STORAGE_KEY = 'USER_TYPE';
const ACTIVE_PORTAL_STORAGE_KEY = 'ACTIVE_PORTAL';

/** Portals that live under their own `/pages/<role>` prefix. */
const PREFIXED_PORTALS: Exclude<AcademicPortalRole, 'admin'>[] = [
  'hod',
  'lecturer',
  'board',
  'provost',
];

@Injectable({
  providedIn: 'root',
})
export class PortalContextService {
  private readonly router = inject(Router);

  getCurrentRole(): AcademicPortalRole {
    return this.resolveRole(this.router.url);
  }

  getRoleBasePath(): string {
    const role = this.getCurrentRole();
    return role === 'admin' ? '/pages' : `/pages/${role}`;
  }

  isLecturerContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'lecturer';
  }

  isHodContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'hod';
  }

  isBoardContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'board';
  }

  /**
   * True on the provost's own pages and on the shared admin pages a provost
   * opens, since the provost portal includes the admin flow.
   */
  isProvostContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'provost';
  }

  isAdminContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'admin';
  }

  /** The portal the signed-in user belongs to, ignoring any active switch. */
  getHomeRole(): AcademicPortalRole {
    const storedUserType =
      sessionStorage.getItem(USER_TYPE_STORAGE_KEY)?.toLowerCase() ?? '';

    // Provost is checked before board so a "Provost (Board)" style label
    // still resolves to the more capable portal.
    if (storedUserType.includes('provost')) {
      return 'provost';
    }

    if (storedUserType.includes('board')) {
      return 'board';
    }

    if (storedUserType.includes('hod')) {
      return 'hod';
    }

    if (storedUserType.includes('lecturer')) {
      return 'lecturer';
    }

    return 'admin';
  }

  getHomeDashboardRoute(): string {
    return this.getDashboardRoute(this.getHomeRole());
  }

  getDashboardRoute(role: AcademicPortalRole): string {
    return role === 'admin' ? '/pages/dashboard' : `/pages/${role}/dashboard`;
  }

  /**
   * Staff whose own portal is HOD/lecturer but who also hold admin
   * permissions can pin themselves to the admin portal; without the override
   * their stored user type would keep resolving them back to their own portal.
   */
  switchToAdminPortal(): void {
    sessionStorage.setItem(ACTIVE_PORTAL_STORAGE_KEY, 'admin');
    void this.router.navigateByUrl(this.getDashboardRoute('admin'));
  }

  switchToHomePortal(): void {
    this.resetPortalOverride();
    void this.router.navigateByUrl(this.getHomeDashboardRoute());
  }

  resetPortalOverride(): void {
    sessionStorage.removeItem(ACTIVE_PORTAL_STORAGE_KEY);
  }

  private resolveRole(url: string): AcademicPortalRole {
    const prefixed = PREFIXED_PORTALS.find((role) =>
      new RegExp(`^/pages/${role}(?:[/?#]|$)`).test(url),
    );

    if (prefixed) {
      return prefixed;
    }

    if (sessionStorage.getItem(ACTIVE_PORTAL_STORAGE_KEY) === 'admin') {
      return 'admin';
    }

    return this.getHomeRole();
  }
}

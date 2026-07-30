import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type AcademicPortalRole = 'admin' | 'lecturer' | 'hod';

const USER_TYPE_STORAGE_KEY = 'USER_TYPE';
const ACTIVE_PORTAL_STORAGE_KEY = 'ACTIVE_PORTAL';

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

    if (role === 'hod') {
      return '/pages/hod';
    }

    if (role === 'lecturer') {
      return '/pages/lecturer';
    }

    return '/pages';
  }

  isLecturerContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'lecturer';
  }

  isHodContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'hod';
  }

  isAdminContext(url = this.router.url): boolean {
    return this.resolveRole(url) === 'admin';
  }

  /** The portal the signed-in user belongs to, ignoring any active switch. */
  getHomeRole(): AcademicPortalRole {
    const storedUserType =
      sessionStorage.getItem(USER_TYPE_STORAGE_KEY)?.toLowerCase() ?? '';

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
    if (role === 'hod') {
      return '/pages/hod/dashboard';
    }

    if (role === 'lecturer') {
      return '/pages/lecturer/dashboard';
    }

    return '/pages/dashboard';
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
    if (url.startsWith('/pages/hod')) {
      return 'hod';
    }

    if (url.startsWith('/pages/lecturer')) {
      return 'lecturer';
    }

    if (sessionStorage.getItem(ACTIVE_PORTAL_STORAGE_KEY) === 'admin') {
      return 'admin';
    }

    return this.getHomeRole();
  }
}

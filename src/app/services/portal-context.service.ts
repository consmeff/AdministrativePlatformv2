import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type AcademicPortalRole = 'admin' | 'lecturer' | 'hod';

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

  private resolveRole(url: string): AcademicPortalRole {
    const storedUserType =
      sessionStorage.getItem('USER_TYPE')?.toLowerCase() ?? '';

    if (url.startsWith('/pages/hod') || storedUserType.includes('hod')) {
      return 'hod';
    }

    if (
      url.startsWith('/pages/lecturer') ||
      storedUserType.includes('lecturer')
    ) {
      return 'lecturer';
    }

    return 'admin';
  }
}

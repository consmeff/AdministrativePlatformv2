import { Component, inject, OnDestroy } from '@angular/core';
import { WidgetService } from '../../services/widget.service';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HodStateService } from '../../pages/hod/hod-state.service';
import { LecturerStateService } from '../../pages/lecturer/lecturer-state.service';
import { PortalContextService } from '../../services/portal-context.service';
import { PermissionService } from '../../services/permission.service';
import { APP_PERMISSIONS } from '../../constants/permissions.constants';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnDestroy {
  _widgetService = inject(WidgetService);
  dashInfoService = inject(DashboardinformationService);
  lecturerStateService = inject(LecturerStateService);
  hodStateService = inject(HodStateService);
  portalContextService = inject(PortalContextService);
  permissionService = inject(PermissionService);
  router = inject(Router);
  dashinfo: DashboardInfo = {} as DashboardInfo;
  currentModuleName = 'Dashboard';
  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.dashInfoService.dashInfo$.subscribe((val) => {
        if (val) {
          this.dashinfo = val;
        }
      }),
    );

    this.currentModuleName = this.resolveModuleName(this.router.url);
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          const navigation = event as NavigationEnd;
          this.currentModuleName = this.resolveModuleName(
            navigation.urlAfterRedirects,
          );
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this._widgetService.setSidebarState({ isvisible: true });
  }

  get currentUserName(): string {
    if (this.portalContextService.isHodContext()) {
      return this.hodStateService.profile().fullName;
    }

    if (this.portalContextService.isLecturerContext()) {
      return this.lecturerStateService.lecturerProfile().fullName;
    }

    return this.dashinfo.username || 'Academic Officer';
  }

  get currentUserRole(): string {
    if (this.portalContextService.isHodContext()) {
      return 'Head of Department';
    }

    if (this.portalContextService.isLecturerContext()) {
      return 'Lecturer';
    }

    return this.dashinfo.role || 'Academic Officer';
  }

  /** Staff on a department portal who also administer applicants. */
  get canSwitchToAdminPortal(): boolean {
    return (
      !this.portalContextService.isAdminContext() &&
      this.permissionService.has(APP_PERMISSIONS.MANAGE_APPLICANTS)
    );
  }

  /** Shown once they have switched, so they can get back to their own portal. */
  get canSwitchToHomePortal(): boolean {
    return (
      this.portalContextService.isAdminContext() &&
      this.portalContextService.getHomeRole() !== 'admin'
    );
  }

  get homePortalLabel(): string {
    return this.portalContextService.getHomeRole() === 'hod'
      ? 'Department Portal'
      : 'Lecturer Portal';
  }

  switchToAdminPortal(): void {
    this.portalContextService.switchToAdminPortal();
  }

  switchToHomePortal(): void {
    this.portalContextService.switchToHomePortal();
  }

  private resolveModuleName(url: string): string {
    if (url.includes('/pages/hod/verification/course-reg')) {
      return 'Course Registration Review';
    }

    if (url.includes('/pages/hod/verification/documents')) {
      return 'Documents Review';
    }

    if (url.includes('/pages/hod/result-review')) {
      return 'Result Review';
    }

    if (url.includes('/pages/hod/students-record')) {
      return 'Students Record';
    }

    if (url.includes('/pages/hod/lecturers')) {
      return 'Lecturers';
    }

    if (url.includes('/pages/hod/courses')) {
      return 'Courses';
    }

    if (url.includes('/pages/hod/overview')) {
      return 'Overview';
    }

    if (url.includes('/pages/hod/my-courses/') && url.includes('/upload')) {
      return 'Upload Result';
    }

    if (url.includes('/pages/hod/my-courses/')) {
      return 'Course Details';
    }

    if (url.includes('/pages/hod/my-courses')) {
      return 'My Courses';
    }

    if (url.includes('/pages/hod/profile')) {
      return 'Profile';
    }

    if (url.includes('/pages/hod/dashboard')) {
      return 'Dashboard';
    }

    if (
      url.includes('/pages/lecturer/my-courses/') &&
      url.includes('/upload')
    ) {
      return 'Upload Result';
    }

    if (url.includes('/pages/lecturer/my-courses/')) {
      return 'Course Details';
    }

    if (url.includes('/pages/lecturer/my-courses')) {
      return 'My Courses';
    }

    if (url.includes('/pages/lecturer/profile')) {
      return 'Profile';
    }

    if (url.includes('/pages/lecturer/dashboard')) {
      return 'Dashboard';
    }

    if (url.includes('/pages/admissions')) {
      return 'Admissions';
    }

    if (url.includes('/pages/payment-records')) {
      return 'Payment Record';
    }

    if (url.includes('/pages/applicants/applicantdetail/')) {
      return 'Applicant Detail';
    }

    if (url.includes('/pages/applicants')) {
      return 'Applicants';
    }

    if (url.includes('/pages/dashboard')) {
      return 'Dashboard';
    }

    return 'Dashboard';
  }
}

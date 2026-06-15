import { Component, inject, OnDestroy } from '@angular/core';
import { WidgetService } from '../../services/widget.service';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LecturerStateService } from '../../pages/lecturer/lecturer-state.service';

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
    if (this.isLecturerContext()) {
      return this.lecturerStateService.lecturerProfile().fullName;
    }

    return this.dashinfo.username || 'Academic Officer';
  }

  get currentUserRole(): string {
    if (this.isLecturerContext()) {
      return 'Lecturer';
    }

    return this.dashinfo.role || 'Academic Officer';
  }

  private resolveModuleName(url: string): string {
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

  private isLecturerContext(): boolean {
    const storedUserType = sessionStorage.getItem('USER_TYPE');

    return (
      this.router.url.startsWith('/pages/lecturer') ||
      storedUserType?.toLowerCase().includes('lecturer') === true
    );
  }
}

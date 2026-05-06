import { Component, inject, OnDestroy } from '@angular/core';
import { WidgetService } from '../../services/widget.service';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnDestroy {
  _widgetService = inject(WidgetService);
  dashInfoService = inject(DashboardinformationService);
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

  private resolveModuleName(url: string): string {
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

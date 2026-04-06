import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../widgets/sidebar/sidebar.component';
import { TopbarComponent } from '../../widgets/topbar/topbar.component';
import { WidgetService } from '../../services/widget.service';
import { CommonModule } from '@angular/common';
import { role, sidebarStateDTO } from '../../model/page.dto';
import { DoughnutComponent } from '../../widgets/doughnut/doughnut.component';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import {
  Application,
  ApplicationListResponse,
  ApplicationSummary,
} from '../../model/dashboard/applicant';
import { Column } from '../../model/page.dto';
import { ApplicationService } from '../../services/application.service';
import { Subscription } from 'rxjs';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    DoughnutComponent,
    DropdownModule,
    FormsModule,
    TableModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  sidebarVisible = false;
  _widgetService = inject(WidgetService);
  _applicationService = inject(ApplicationService);
  dashInfoService = inject(DashboardinformationService);
  _dash: DashboardInfo = {} as DashboardInfo;
  staffs: role[] = [];
  selectedstaff = 1;
  application!: Application[];
  subscriptions = new Subscription();
  cols!: Column[];
  applicationList: Application[] = [];
  app_summ: ApplicationSummary[] = [];
  busyService = inject(BusyIndicatorService);

  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });

    this.dashInfoService.dashInfo$.subscribe((val) => {
      this._dash = val;
    });
  }

  ngOnInit(): void {
    this.busyService.show();
    this.subscriptions.add(
      this._applicationService
        .getapplications(undefined, 5)
        .subscribe((data: ApplicationListResponse) => {
          if (data.data.length > 0) {
            this.applicationList = data.data;
            this.populateSummary();
            this._dash.academicsession = this.applicationList[0].session.name;
            this.dashInfoService.setdashInfo(this._dash);
            this.busyService.hide();
          }
        }),
    );

    this.staffs = [
      { name: 'Acad. Officer', code: 1 },
      { name: 'Admin', code: 2 },
    ];

    this.cols = [
      { field: 'application_no', header: 'Application Number' },
      { field: 'first_name', header: 'First Name' },
      { field: 'last_name', header: 'Last Name' },
      { field: 'created_at', header: 'Submission Date' },
      { field: 'program', header: 'Pref. Programme' },
      { field: 'approval_status', header: 'Status' },
      { field: 'action', header: 'Actions' },
    ];
  }
  populateSummary() {
    const batch = this.applicationList.slice(0, 5);
    batch.forEach((v) => {
      const _summ: ApplicationSummary = {
        application_no: v.application_no,
        first_name: v.first_name,
        last_name: v.last_name,
        created_at: v.created_at.toString(),
        program: v.program.name,
        approval_status: v.approval_status,
        action: '<i class="bi bi-three-dots"></i>',
      };
      this.app_summ.push(_summ);
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarHide() {
    this.sidebarVisible = false;
  }
}

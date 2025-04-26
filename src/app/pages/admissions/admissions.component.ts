import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TopbarComponent } from '../../widgets/topbar/topbar.component';
import { SidebarComponent } from '../../widgets/sidebar/sidebar.component';
import { WidgetService } from '../../services/widget.service';
import { appstatus, Column, sidebarStateDTO } from '../../model/page.dto';
import { TableModule } from 'primeng/table';
import { ApplicationService } from '../../services/application.service';
import { Router } from '@angular/router';
import { AdmissionSummary, Application, ApplicationListResponse, ApplicationSummary } from '../../model/dashboard/applicant';
import { Subscription } from 'rxjs';
import {  ButtonModule } from 'primeng/button';
import {  DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { BusyIndicatorService } from '../../services/busy-indicator.service';

@Component({
  selector: 'app-admissions',

  imports: [CommonModule, TopbarComponent, SidebarComponent,FormsModule, TableModule,ButtonModule,DropdownModule],
  templateUrl: './admissions.component.html',
  styleUrl: './admissions.component.scss'
})
export class AdmissionsComponent {

  sidebarVisible = false;
  _widgetService = inject(WidgetService)
  _applicationService = inject(ApplicationService);
  router = inject(Router);
  busyIndicator=inject(BusyIndicatorService)

  application!: Application[];
  subscriptions = new Subscription();
  selectedStatus: number = 1;
  approval_status: appstatus[] = [];
  cols!: Column[];
  applicationList: Application[] = [];
  app_summ: AdmissionSummary[] = [];
  total_record_count = 0;
  first = 0;

  rows = 100;



  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    })
  }


  ngOnInit(): void {
    this.busyIndicator.show();
    this.subscriptions.add(
      
      this._applicationService.getapplications(undefined, undefined, this.first + 1).subscribe((data: ApplicationListResponse) => {
        if (data.data.length > 0) {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
          this.busyIndicator.hide();
        }
      })
    )
    this.approval_status = [
      { name: "All", code: 0 },
      { name: "Pending", code: 1 },
      { name: "Shortlisted", code: 2 },
      { name: "Compliance", code: 3 },
      { name: "Rejected", code: 4 },
      { name: "Resolved", code: 5 }

    ];


    this.cols = [
      { field: 'application_no', header: 'Application Number' },
      { field: 'full_name', header: 'Full Name' },
      { field: 'submission_date', header: 'Submission Date' },
      { field: 'program', header: 'Programme' },
      { field: 'approval_status', header: 'Status' },

    ];

  }
  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.app_summ ? this.first === this.app_summ.length - this.rows : true;
  }

  isFirstPage(): boolean {
    return this.app_summ ? this.first === 0 : true;
  }
  populateSummary() {
    let batch = this.applicationList;
    batch.forEach((v, i) => {
      let _summ: AdmissionSummary = {
        application_no: v.application_no,
        full_name: `${v.first_name} ${v.last_name}`,
        
        submission_date: v.created_at.toString(),
        program: v.program.name,
        approval_status: v.approval_status,
       
      };
      this.app_summ.push(_summ);
    })
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarHide() {
    this.sidebarVisible = false;
  }

  

  

}

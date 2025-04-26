import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';

import { debounceTime, distinctUntilChanged, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { TableModule } from 'primeng/table';

import { DropdownModule } from 'primeng/dropdown';
import { Button } from 'primeng/button';
import { Modal } from 'bootstrap';
import { Application, ApplicationSummary, ApplicationListResponse } from '../../../model/dashboard/applicant';
import { appstatus, Column, sidebarStateDTO } from '../../../model/page.dto';
import { ApplicationService } from '../../../services/application.service';
import { WidgetService } from '../../../services/widget.service';
import { ShareModule } from '../../../shared/share/share.module';
import { SidebarComponent } from '../../../widgets/sidebar/sidebar.component';
import { TopbarComponent } from '../../../widgets/topbar/topbar.component';
import { Router } from '@angular/router';
import { BusyIndicatorService } from '../../../services/busy-indicator.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-applicantlists',
  imports: [ShareModule, TopbarComponent, DropdownModule, SidebarComponent, TableModule, Button, FormsModule],
  templateUrl: './applicantlists.component.html',
  styleUrl: './applicantlists.component.scss'
})
export class ApplicantlistsComponent {

  selectedRowData: any;
  showActionMenu = false;
  menuPosition = { x: 0, y: 0 };
  sidebarVisible = false;
  _widgetService = inject(WidgetService)
  _applicationService = inject(ApplicationService);
  cd =inject(ChangeDetectorRef);
  router = inject(Router);
  busyService = inject(BusyIndicatorService);
  application!: Application[];
  subscriptions = new Subscription();
  selectedStatus: number = 1;
  approval_status: appstatus[] = [];
  cols!: Column[];
  applicationList: Application[] = [];
  app_summ: ApplicationSummary[] = [];
  total_record_count = 0;
  first = 0;

  rows = 10;

  actionModal: Modal | undefined;
  searchText: string = "";
  private searchTextChanged = new Subject<string>();
  searchKeyword:string|undefined=undefined;


  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    })

    this.searchTextChanged.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      switchMap(searchTerm => this.performSearch(searchTerm))
    ).subscribe((data:any) => {
      if (data.data.length > 0) {
        this.total_record_count = data.total;
        this.applicationList = data.data;
        this.populateSummary();
        this.busyService.hide();
        this.cd.detectChanges()
      }
    });
    
  }
  performSearch(searchTerm: string): any {
    this.searchKeyword=searchTerm;
    return this.fetchRecords();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu when clicking anywhere else
    if (!(event.target as Element).closest('.action-icon') &&
      !(event.target as Element).closest('.action-menu')) {
      this.showActionMenu = false;
    }
  }
  ngOnInit(): void {
    this.busyService.show();
    this.subscriptions.add(
      this._applicationService.getapplications(this.searchKeyword, undefined, 10, true, this.first + 1).subscribe((data: ApplicationListResponse) => {
        if (data.data.length > 0) {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
          this.busyService.hide();
        }
      })
    );
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
      { field: 'first_name', header: 'First Name' },
      { field: 'last_name', header: 'Last Name' },
      { field: 'created_at', header: 'Submission Date' },
      { field: 'program', header: 'Pref. Programme' },
      { field: 'approval_status', header: 'Status' },
      { field: 'action', header: 'Actions' }
    ];

  }
  private fetchRecords() : Observable<ApplicationListResponse>{
    return this._applicationService.getapplications(this.searchKeyword, undefined, 10, true, this.first + 1);
  }

  onSearchTextChanged(text: string) {
    if(text !=undefined){
      this.searchTextChanged.next(text);
    }
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
    let newSummary: ApplicationSummary[] = [];
    let batch = this.applicationList;
    batch.forEach((v, i) => {
      let _summ: ApplicationSummary = {
        application_no: v.application_no,
        first_name: v.first_name,
        last_name: v.last_name,
        created_at: v.created_at.toString(),
        program: v.program.name,
        approval_status: v.approval_status,
        action: '<i class="bi bi-three-dots"></i>'
      };
      newSummary.push(_summ);
    })
    this.app_summ = newSummary;
    this.cd.detectChanges();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarHide() {
    this.sidebarVisible = false;
  }

  showActionModal(event: MouseEvent, rowData: any) {
    event.stopPropagation();

    // Toggle menu if clicking the same row's action icon
    if (this.selectedRowData?.id === rowData.id && this.showActionMenu) {
      this.showActionMenu = false;
      return;
    }

    this.selectedRowData = rowData;
    this.showActionMenu = true;

    // Position the menu near the clicked icon
    this.menuPosition = {
      x: event.clientX - 10,  // 10px left offset
      y: event.clientY + 10   // 10px below the icon
    };

    // Adjust position if near window edges
    const menuWidth = 250; // Approximate menu width
    const menuHeight = 200; // Approximate menu height

    if (this.menuPosition.x + menuWidth > window.innerWidth) {
      this.menuPosition.x = window.innerWidth - menuWidth - 10;
    }

    if (this.menuPosition.y + menuHeight > window.innerHeight) {
      this.menuPosition.y = event.clientY - menuHeight - 10;
    }
  }

  handleAction(action: string, rowData: any) {
    const firstColumnValue: string = rowData['application_no']; // Adjust to your first column field

    // alert(`Action: ${action}\nRow ID: ${firstColumnValue}`);
    this.showActionMenu = false;

    // Handle specific actions as needed
    switch (action.toLowerCase()) {
      case 'view profile':
        this.router.navigateByUrl(`/pages/applicants/applicantdetail/${firstColumnValue.replaceAll("/", "_")}`)
        break;
      // ... other cases
    }
  }

}

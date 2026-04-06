import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';

import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { TableModule } from 'primeng/table';

import { DropdownModule } from 'primeng/dropdown';
import { Modal } from 'bootstrap';
import {
  Application,
  ApplicationSummary,
  ApplicationListResponse,
} from '../../../model/dashboard/applicant';
import { appstatus, Column, sidebarStateDTO } from '../../../model/page.dto';
import { ApplicationService } from '../../../services/application.service';
import { WidgetService } from '../../../services/widget.service';
import { ShareModule } from '../../../shared/share/share.module';
import { SidebarComponent } from '../../../widgets/sidebar/sidebar.component';
import { TopbarComponent } from '../../../widgets/topbar/topbar.component';
import { Router } from '@angular/router';
import { BusyIndicatorService } from '../../../services/busy-indicator.service';
import { FormsModule } from '@angular/forms';

interface PagingEvent {
  first: number;
  rows: number;
}

interface LazyLoadEvent {
  first?: number | null;
  rows?: number | null;
  sortField?: string | string[] | null;
  sortOrder?: number | null;
}

@Component({
  selector: 'app-applicantlists',
  imports: [
    ShareModule,
    TopbarComponent,
    DropdownModule,
    SidebarComponent,
    TableModule,
    FormsModule,
  ],
  templateUrl: './applicantlists.component.html',
  styleUrl: './applicantlists.component.scss',
})
export class ApplicantlistsComponent implements OnInit {
  selectedRowData?: ApplicationSummary;
  showActionMenu = false;
  menuPosition = { x: 0, y: 0 };
  sidebarVisible = false;
  _widgetService = inject(WidgetService);
  _applicationService = inject(ApplicationService);
  cd = inject(ChangeDetectorRef);
  router = inject(Router);
  busyService = inject(BusyIndicatorService);
  application!: Application[];
  subscriptions = new Subscription();
  selectedStatus: appstatus = { name: 'All', code: 0 };
  approval_status: appstatus[] = [];
  cols!: Column[];
  applicationList: Application[] = [];
  app_summ: ApplicationSummary[] = [];
  total_record_count = 0;
  first = 0;

  rows = 10;

  actionModal: Modal | undefined;
  searchText = '';
  private searchTextChanged = new Subject<string>();
  searchKeyword: string | undefined = undefined;

  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });

    this.searchTextChanged
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        switchMap((searchTerm) => this.performSearch(searchTerm)),
      )
      .subscribe((data: ApplicationListResponse) => {
        if (data.data.length > 0) {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
          this.busyService.hide();
          this.cd.detectChanges();
        }
      });
  }
  performSearch(searchTerm: string): Observable<ApplicationListResponse> {
    this.searchKeyword = searchTerm;
    this.first = 0; // Reset pagination to the first page
    return this.fetchRecords();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu when clicking anywhere else
    if (
      !(event.target as Element).closest('.action-icon') &&
      !(event.target as Element).closest('.action-menu')
    ) {
      this.showActionMenu = false;
    }
  }
  ngOnInit(): void {
    this.busyService.show();
    this.fetchRecords().subscribe((data: ApplicationListResponse) => {
      if (data.data.length > 0) {
        this.total_record_count = data.total;
        this.applicationList = data.data;
        this.populateSummary();
        this.busyService.hide();
      }
    });

    this.approval_status = [
      { name: 'All', code: 0 },
      { name: 'Pending', code: 1 },
      { name: 'Shortlisted', code: 2 },
      { name: 'Compliance', code: 3 },
      { name: 'Rejected', code: 4 },
      { name: 'Resolved', code: 5 },
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
  private fetchRecords(
    sortField?: string,
    sortOrder?: number,
  ): Observable<ApplicationListResponse> {
    return this._applicationService.getapplications(
      this.searchKeyword, // Search keyword
      // Filters (if applicable)
      this.rows, // Rows per page
      // Include additional data (if needed)
      this.first + 1, // First record index
      sortField, // Field to sort by
      sortOrder, // Sort order (1 for ascending, -1 for descending)
    );
  }

  onStatusChange(event: unknown) {
    void event;
    // Reset pagination to the first page when applying a new filter
    this.first = 0;

    // Use the selected status as part of the search/filter criteria
    if (this.selectedStatus && this.selectedStatus.code !== undefined) {
      this.searchKeyword = `${this.selectedStatus.name}`; // Format the search keyword for the backend
    } else {
      this.searchKeyword = undefined; // Clear the filter if "All" is selected
    }

    // Fetch data with the updated filter
    this.fetchRecords('approval_status').subscribe(
      (data: ApplicationListResponse) => {
        if (data.data.length > 0) {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
        }
      },
    );
  }

  onLazyLoad(event: LazyLoadEvent) {
    // Update pagination parameters
    this.first = event.first || 0; // First record index
    this.rows = event.rows || 10; // Number of rows per page

    // Get sorting parameters
    const sortField =
      typeof event.sortField === 'string' ? event.sortField : undefined;
    const sortOrder = event.sortOrder ?? undefined;

    // Fetch data from the server
    this.fetchRecords(sortField, sortOrder).subscribe(
      (data: ApplicationListResponse) => {
        if (data.data.length > 0) {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
        }
      },
    );
  }

  onSearchTextChanged(text: string) {
    if (text != undefined) {
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

  pageChange(event: PagingEvent) {
    this.first = event.first;
    this.rows = event.rows;

    // Fetch new data based on updated pagination parameters
    this.fetchRecords().subscribe((data: ApplicationListResponse) => {
      if (data.data.length > 0) {
        this.total_record_count = data.total;
        this.applicationList = data.data;
        this.populateSummary();
      }
    });
  }

  isLastPage(): boolean {
    return this.app_summ
      ? this.first === this.app_summ.length - this.rows
      : true;
  }

  isFirstPage(): boolean {
    return this.app_summ ? this.first === 0 : true;
  }
  populateSummary() {
    const newSummary: ApplicationSummary[] = [];
    const batch = this.applicationList;
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
      newSummary.push(_summ);
    });
    this.app_summ = newSummary;
    this.cd.detectChanges();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarHide() {
    this.sidebarVisible = false;
  }

  showActionModal(event: MouseEvent, rowData: ApplicationSummary) {
    event.stopPropagation();
    // console.log(rowData.id)
    // Toggle menu if clicking the same row's action icon
    if (
      this.selectedRowData?.application_no === rowData.application_no &&
      this.showActionMenu
    ) {
      this.showActionMenu = false;
      return;
    }

    this.selectedRowData = rowData;
    this.showActionMenu = true;

    // Position the menu near the clicked icon
    this.menuPosition = {
      x: event.clientX - 10, // 10px left offset
      y: event.clientY + 10, // 10px below the icon
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

  handleAction(action: string, rowData: ApplicationSummary) {
    const firstColumnValue = rowData.application_no;

    // alert(`Action: ${action}\nRow ID: ${firstColumnValue}`);
    this.showActionMenu = false;

    // Handle specific actions as needed
    switch (action.toLowerCase()) {
      case 'view profile':
        this.router.navigateByUrl(
          `/pages/applicants/applicantdetail/${firstColumnValue.replaceAll('/', '_')}`,
        );
        break;
      // ... other cases
    }
  }
}

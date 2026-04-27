import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { appstatus, Column } from '../../model/page.dto';
import { TableModule } from 'primeng/table';
import { ApplicationService } from '../../services/application.service';
import { Router } from '@angular/router';
import {
  AdmissionSummary,
  Application,
  ApplicationListResponse,
} from '../../model/dashboard/applicant';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { BusyIndicatorService } from '../../services/busy-indicator.service';

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
  selector: 'app-admissions',

  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule],
  templateUrl: './admissions.component.html',
  styleUrl: './admissions.component.scss',
})
export class AdmissionsComponent implements OnInit {
  _applicationService = inject(ApplicationService);
  router = inject(Router);
  busyService = inject(BusyIndicatorService);
  cd = inject(ChangeDetectorRef);
  application!: Application[];
  subscriptions = new Subscription();
  selectedStatus: appstatus = { name: 'All', code: 0 };
  approval_status: appstatus[] = [];
  cols!: Column[];
  applicationList: Application[] = [];
  app_summ: AdmissionSummary[] = [];
  total_record_count = 0;
  first = 0;

  rows = 100;

  searchText = '';
  private searchTextChanged = new Subject<string>();
  searchKeyword: string | undefined = undefined;

  constructor() {
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
      { field: 'full_name', header: 'Full Name' },
      { field: 'submission_date', header: 'Submission Date' },
      { field: 'program', header: 'Programme' },
      { field: 'approval_status', header: 'Status' },
    ];
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

  onLazyLoad(event: LazyLoadEvent) {
    // Update pagination parameters
    this.first = event.first || 0; // First record index
    this.rows = event.rows || 10; // Number of rows per page

    // Get sorting parameters
    const sortFieldValue =
      typeof event.sortField === 'string' ? event.sortField : undefined;
    const sortField =
      sortFieldValue === 'full_name' ? 'first_name' : sortFieldValue;
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
  populateSummary() {
    const batch = this.applicationList;
    const newSummary: AdmissionSummary[] = [];
    batch.forEach((v) => {
      const programmeName =
        typeof v.department === 'string'
          ? v.department
          : (v.department?.name ?? v.program?.name ?? 'N/A');
      const _summ: AdmissionSummary = {
        application_no: v.application_no,
        full_name: `${v.first_name} ${v.last_name}`,
        submission_date: (v.updated_at ?? v.created_at ?? '').toString(),
        program: programmeName,
        approval_status: v.approval_status,
      };
      newSummary.push(_summ);
    });
    this.app_summ = newSummary;
    this.cd.detectChanges();
  }
}

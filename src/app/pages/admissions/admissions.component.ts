import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { appstatus, Column } from '../../model/page.dto';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import {
  ApplicationService,
  ComplianceDirectivePayload,
} from '../../services/application.service';
import { Router } from '@angular/router';
import {
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
import {
  StatusIndicatorComponent,
  StatusTone,
} from '../../widgets/status-indicator/status-indicator.component';
import { SearchInputComponent } from '../../widgets/search-input/search-input.component';
import { TableRowActionsComponent } from '../../widgets/table-row-actions/table-row-actions.component';
import { ApplicantdetailComponent } from '../applicants/applicantdetail/applicantdetail.component';
import { AdmissionsUploadFlowComponent } from './upload-flow/admissions-upload-flow.component';

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

interface AdmissionTableRow {
  id: number;
  application_no: string;
  full_name: string;
  jamb_score: number | string;
  o_level: string;
  cbt_score: number | string;
  program: string;
  status_text: string;
  status_tone: StatusTone;
  decision_category: AdmissionDecisionFilter;
}

type AdmissionDecisionFilter =
  | 'all'
  | 'pending-review'
  | 'pending-publish'
  | 'admitted';

@Component({
  selector: 'app-admissions',

  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    DrawerModule,
    StatusIndicatorComponent,
    SearchInputComponent,
    TableRowActionsComponent,
    ApplicantdetailComponent,
    AdmissionsUploadFlowComponent,
  ],
  templateUrl: './admissions.component.html',
  styleUrl: './admissions.component.scss',
})
export class AdmissionsComponent implements OnInit, OnDestroy {
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
  app_summ: AdmissionTableRow[] = [];
  filteredRows: AdmissionTableRow[] = [];
  total_record_count = 0;
  first = 0;

  rows = 100;

  searchText = '';
  selectedRows: AdmissionTableRow[] = [];
  selectedApplicationNo: string | null = null;
  isApplicantDrawerVisible = false;
  activeCardFilter: AdmissionDecisionFilter = 'all';
  private searchTextChanged = new Subject<string>();
  searchKeyword: string | undefined = undefined;

  constructor() {
    this.subscriptions.add(
      this.searchTextChanged
        .pipe(
          debounceTime(2000),
          distinctUntilChanged(),
          switchMap((searchTerm) => this.performSearch(searchTerm)),
        )
        .subscribe((data: ApplicationListResponse) => {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
          this.busyService.hide();
          this.cd.detectChanges();
        }),
    );
  }
  performSearch(searchTerm: string): Observable<ApplicationListResponse> {
    this.searchKeyword = searchTerm;
    this.first = 0; // Reset pagination to the first page
    return this.fetchRecords();
  }

  ngOnInit(): void {
    this.busyService.show();
    this.fetchRecords().subscribe((data: ApplicationListResponse) => {
      this.total_record_count = data.total;
      this.applicationList = data.data;
      this.populateSummary();
      this.busyService.hide();
    });
    this.approval_status = [
      { name: 'All', code: 0 },
      { name: 'Pending', code: 1 },
      { name: 'Shortlisted', code: 2 },
      { name: 'Compliance', code: 3 },
      { name: 'Rejected', code: 4 },
      { name: 'Resolved', code: 5 },
    ];

    this.cols = [];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
      this.total_record_count = data.total;
      this.applicationList = data.data;
      this.populateSummary();
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
        this.total_record_count = data.total;
        this.applicationList = data.data;
        this.populateSummary();
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
        this.total_record_count = data.total;
        this.applicationList = data.data;
        this.populateSummary();
      },
    );
  }
  populateSummary() {
    const batch = this.applicationList;
    const newSummary: AdmissionTableRow[] = [];
    batch.forEach((v) => {
      const programmeName =
        typeof v.department === 'string'
          ? v.department
          : (v.department?.name ?? v.program?.name ?? 'N/A');
      const status = this.resolveStatus(v.approval_status);
      const _summ: AdmissionTableRow = {
        id: v.id,
        application_no: v.application_no,
        full_name: `${v.first_name} ${v.last_name}`,
        jamb_score: v.utme_score ?? v.utme_result?.score ?? 'N/A',
        o_level: `${v.o_level_point ?? 'N/A'} Points`,
        cbt_score: v.utme_result?.score ?? 'N/A',
        program: programmeName,
        status_text: status.text,
        status_tone: status.tone,
        decision_category: status.category,
      };
      newSummary.push(_summ);
    });
    this.app_summ = newSummary;
    this.applyCardFilter();
    this.cd.detectChanges();
  }

  private resolveStatus(status: string): {
    text: string;
    tone: StatusTone;
    category: AdmissionDecisionFilter;
  } {
    const value = (status ?? '').toLowerCase();
    if (value.includes('admit') || value.includes('approved')) {
      return { text: 'Admitted', tone: 'shortlisted', category: 'admitted' };
    }
    if (
      value.includes('publish') ||
      value.includes('shortlist') ||
      value.includes('pending publish')
    ) {
      return {
        text: 'Pending Publish',
        tone: 'resubmitted',
        category: 'pending-publish',
      };
    }
    if (value.includes('reject')) {
      return { text: 'Rejected', tone: 'rejected', category: 'pending-review' };
    }
    return {
      text: 'Pending Review',
      tone: 'pending',
      category: 'pending-review',
    };
  }

  setCardFilter(filter: AdmissionDecisionFilter) {
    this.activeCardFilter = filter;
    this.applyCardFilter();
  }

  private applyCardFilter() {
    if (this.activeCardFilter === 'all') {
      this.filteredRows = [...this.app_summ];
      return;
    }
    this.filteredRows = this.app_summ.filter(
      (row) => row.decision_category === this.activeCardFilter,
    );
  }

  isCardActive(filter: AdmissionDecisionFilter): boolean {
    return this.activeCardFilter === filter;
  }

  getCardCount(filter: AdmissionDecisionFilter): number {
    if (filter === 'all') {
      return this.total_record_count || this.app_summ.length;
    }
    return this.app_summ.filter((row) => row.decision_category === filter)
      .length;
  }

  getPrimaryActionLabel(): string {
    return this.activeCardFilter === 'pending-publish'
      ? 'Publish Admission'
      : 'Set Cutoff';
  }

  shouldShowPrimaryAction(): boolean {
    return this.activeCardFilter !== 'admitted';
  }

  onPrimaryActionClick() {
    if (this.activeCardFilter === 'pending-publish') {
      window.alert('Publish admission action is not yet wired.');
      return;
    }
    window.alert('Set cutoff action is not yet wired.');
  }

  viewProfile(row: AdmissionTableRow) {
    this.selectedApplicationNo = row.application_no;
    this.isApplicantDrawerVisible = true;
  }

  closeApplicantDrawer() {
    this.isApplicantDrawerVisible = false;
    this.selectedApplicationNo = null;
  }

  shortlistSingle(row: AdmissionTableRow) {
    this.performApplicantAction(
      this._applicationService.shortlistApplicants({
        applicant_ids: [row.id],
      }),
      'Candidate shortlisted successfully.',
    );
  }

  openComplianceForSingle(row: AdmissionTableRow) {
    const payload: ComplianceDirectivePayload = {
      applicant_ids: [row.id],
      extra_note: '',
    };
    this.performApplicantAction(
      this._applicationService.issueComplianceDirective(payload),
      'Compliance directive issued successfully.',
    );
  }

  private performApplicantAction(
    request: Observable<unknown>,
    successMessage: string,
  ) {
    this.busyService.show();
    request.subscribe({
      next: () => {
        window.alert(successMessage);
        this.fetchRecords().subscribe((data: ApplicationListResponse) => {
          this.total_record_count = data.total;
          this.applicationList = data.data;
          this.populateSummary();
        });
      },
      error: (err) => {
        const message =
          err?.error?.message || err?.error?.detail || 'Action failed.';
        window.alert(message);
      },
      complete: () => {
        this.busyService.hide();
      },
    });
  }

  get showEmptyState(): boolean {
    return this.total_record_count === 0;
  }
}

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AdminDashboardMetrics } from '../../../model/dashboard/admin-dashboard.dto';
import {
  Application,
  ApplicationListResponse,
} from '../../../model/dashboard/applicant';
import { ActionModalPayload } from '../../../widgets/action-note-modal/action-note-modal.component';
import {
  ApplicationService,
  ComplianceDirectivePayload,
  GetApplicantsQuery,
} from '../../../services/application.service';
import { BusyIndicatorService } from '../../../services/busy-indicator.service';
import { ShareModule } from '../../../shared/share/share.module';
import { ActionNoteModalComponent } from '../../../widgets/action-note-modal/action-note-modal.component';
import { AppPaginationComponent } from '../../../widgets/app-pagination/app-pagination.component';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { FilterSelectComponent } from '../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import {
  StatusIndicatorComponent,
  StatusTone,
} from '../../../widgets/status-indicator/status-indicator.component';
import { TableRowActionsComponent } from '../../../widgets/table-row-actions/table-row-actions.component';
import { ApplicantdetailComponent } from '../applicantdetail/applicantdetail.component';
import { MetricCardComponent } from '../../../widgets/metric-card/metric-card.component';

interface FilterOption {
  label: string;
  value: string;
}

interface ApplicationListRow {
  id: number;
  application_no: string;
  full_name: string;
  jamb_score: number | string;
  o_level: number | string;
  submission_date: string;
  programme: string;
  status_text: string;
  status_tone: StatusTone;
}

interface ApplicantFilterCard {
  label: string;
  filter: ApplicantCardFilter;
}

type ApplicantCardFilter =
  | 'all'
  | 'pending'
  | 'shortlisted'
  | 'directive'
  | 'resubmitted';

@Component({
  selector: 'app-applicantlists',
  imports: [
    ShareModule,
    TableModule,
    DrawerModule,
    FormsModule,
    ActionNoteModalComponent,
    StatusIndicatorComponent,
    SearchInputComponent,
    FilterSelectComponent,
    TableRowActionsComponent,
    AppPaginationComponent,
    ButtonComponent,
    ApplicantdetailComponent,
    MetricCardComponent,
  ],
  templateUrl: './applicantlists.component.html',
  styleUrl: './applicantlists.component.scss',
})
export class ApplicantlistsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchTextChanged = new Subject<string>();
  private readonly applicationService = inject(ApplicationService);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly busyService = inject(BusyIndicatorService);
  private readonly route = inject(ActivatedRoute);

  readonly tableColumns = [
    'Applicant',
    'JAMB',
    'O Level',
    'Submission Date',
    'Programme',
    'Status',
    'Actions',
  ];

  readonly statusOptions: FilterOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Shortlisted', value: 'Shortlisted' },
    { label: 'Compliance Required', value: 'Complaince Required' },
    { label: 'Resubmitted', value: 'Resubmited' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Admitted', value: 'Admitted' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Submitted', value: 'Submitted' },
  ];
  readonly formOptions: FilterOption[] = [
    { label: 'All Form', value: 'all' },
    { label: 'OND', value: 'ond' },
    { label: 'HND', value: 'hnd' },
  ];
  readonly orderingOptions: FilterOption[] = [
    { label: 'Newest First', value: '-created_at' },
    { label: 'Oldest First', value: 'created_at' },
    { label: 'Name (A-Z)', value: 'first_name' },
    { label: 'Name (Z-A)', value: '-first_name' },
    { label: 'Application No.', value: 'application_no' },
  ];
  readonly directiveDocumentOptions = [
    'Certificate of Birth',
    "O'Level Result",
    'Passport Photograph',
    'UTME Result',
  ];
  readonly directiveReasons = [
    'Blurry Document',
    'Wrong File Uploaded',
    'Name Mismatch with Application',
    'Others (specify below)',
  ];

  selectedStatus: FilterOption = this.statusOptions[0];
  selectedForm: FilterOption = this.formOptions[0];
  selectedOrdering: FilterOption = this.orderingOptions[0];
  activeCardFilter: ApplicantCardFilter = 'all';
  readonly filterCards: ApplicantFilterCard[] = [
    { label: 'All Applicants', filter: 'all' },
    { label: 'Pending Review', filter: 'pending' },
    { label: 'Shortlisted', filter: 'shortlisted' },
    { label: 'Directive Issued', filter: 'directive' },
    { label: 'Resubmitted', filter: 'resubmitted' },
  ];

  metrics: AdminDashboardMetrics = {
    total_applicants: 0,
    top_5_courses: [],
    approval_status_breakdown: {
      total_pending: 0,
      total_rejected: 0,
      total_shortlisted: 0,
      total_approved: 0,
      total_admitted: 0,
      total_compliance_required: 0,
    },
    payment_status_counts: [],
  };

  applicationList: Application[] = [];
  appRows: ApplicationListRow[] = [];
  filteredRows: ApplicationListRow[] = [];
  total_record_count = 0;
  first = 0;
  rows = 10;
  searchText = '';
  searchKeyword: string | undefined = undefined;

  selectedApplicantIds: number[] = [];
  selectedRows: ApplicationListRow[] = [];
  pendingDirectiveApplicantIds: number[] = [];
  isApplicantDrawerVisible = false;
  selectedApplicationNo: string | null = null;

  isReasonModalVisible = false;
  isReasonActionLoading = false;
  reasonModalTitle = 'Issue Compliance Directive';
  reasonModalPrompt = '';
  reasonModalConfirmLabel = 'Issue Directive';
  reasonModalInitialNote = '';
  directiveSelectedReason = '';
  directiveSelectedDocuments: string[] = [];

  ngOnInit(): void {
    this.applicationService.getAdminDashboardMetrics().subscribe((metrics) => {
      this.metrics = metrics;
    });

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: ParamMap) => {
        this.syncFormFromQuery(params.get('level'));
        this.first = 0;
        this.fetchRecords();
      });

    this.searchTextChanged
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchKeyword = searchTerm.trim() || undefined;
        this.first = 0;
        this.fetchRecords();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchRecords(): void {
    this.busyService.show();
    const pageNumber = Math.floor(this.first / this.rows) + 1;
    const query: GetApplicantsQuery = {
      search: this.searchKeyword,
      approval_status:
        this.selectedStatus.value === 'all'
          ? undefined
          : this.selectedStatus.value,
      form:
        this.selectedForm.value === 'all' ? undefined : this.selectedForm.value,
      ordering: this.selectedOrdering.value,
    };

    this.applicationService
      .getapplications(
        undefined,
        this.rows,
        pageNumber,
        undefined,
        undefined,
        query,
      )
      .subscribe((data: ApplicationListResponse) => {
        this.total_record_count = data.total;
        this.applicationList = data.data;
        this.populateSummary();
        this.applyLocalFilters();
        this.busyService.hide();
        this.cd.detectChanges();
      });
  }

  onStatusChange(option: FilterOption) {
    this.selectedStatus = option;
    this.activeCardFilter = this.getCardFilterFromStatus(option.value);
    this.first = 0;
    this.fetchRecords();
  }

  onFormChange(option: FilterOption) {
    this.selectedForm = option;
    this.first = 0;
    this.fetchRecords();
  }

  onOrderingChange(option: FilterOption) {
    this.selectedOrdering = option;
    this.first = 0;
    this.fetchRecords();
  }

  onSearchTextChanged(text: string) {
    this.searchTextChanged.next(text);
  }

  onPageChange(event: { first?: number; rows?: number }) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.fetchRecords();
  }

  private populateSummary() {
    this.appRows = this.applicationList.map((item) => {
      const status = this.resolveStatus(item.approval_status);
      return {
        id: item.id,
        application_no: item.application_no,
        full_name: `${item.first_name} ${item.last_name}`.trim(),
        jamb_score: item.utme_score ?? item.utme_result?.score ?? 'N/A',
        o_level: item.o_level_point ?? 'N/A',
        submission_date: this.formatDate(
          item.updated_at ?? item.created_at ?? '',
        ),
        programme: this.getProgrammeName(item),
        status_text: status.text,
        status_tone: status.tone,
      };
    });
  }

  private applyLocalFilters() {
    this.filteredRows = [...this.appRows];
    this.selectedApplicantIds = this.selectedApplicantIds.filter((id) =>
      this.filteredRows.some((row) => row.id === id),
    );
    this.selectedRows = this.filteredRows.filter((row) =>
      this.selectedApplicantIds.includes(row.id),
    );
  }

  setCardFilter(filter: ApplicantCardFilter): void {
    this.activeCardFilter = filter;
    this.selectedStatus =
      this.statusOptions.find(
        (item) => item.value === this.getApprovalStatusForCardFilter(filter),
      ) ?? this.statusOptions[0];
    this.first = 0;
    this.fetchRecords();
  }

  isCardActive(filter: ApplicantCardFilter): boolean {
    return this.activeCardFilter === filter;
  }

  getCardCount(filter: ApplicantCardFilter): number {
    if (filter === 'all') {
      return this.metrics.total_applicants || this.total_record_count;
    }
    return this.appRows.filter((row) => row.status_tone === filter).length;
  }

  private getCardFilterFromStatus(value: string): ApplicantCardFilter {
    const normalized = value.toLowerCase();
    if (normalized.includes('shortlist')) {
      return 'shortlisted';
    }
    if (
      normalized.includes('complaince') ||
      normalized.includes('compliance')
    ) {
      return 'directive';
    }
    if (normalized.includes('resub')) {
      return 'resubmitted';
    }
    if (normalized.includes('pending')) {
      return 'pending';
    }
    return 'all';
  }

  private getApprovalStatusForCardFilter(filter: ApplicantCardFilter): string {
    if (filter === 'pending') {
      return 'Pending';
    }
    if (filter === 'shortlisted') {
      return 'Shortlisted';
    }
    if (filter === 'directive') {
      return 'Complaince Required';
    }
    if (filter === 'resubmitted') {
      return 'Resubmited';
    }
    return 'all';
  }

  private syncFormFromQuery(level: string | null): void {
    const normalizedLevel = (level ?? '').toLowerCase();
    const matched =
      this.formOptions.find((option) => option.value === normalizedLevel) ??
      this.formOptions[0];
    this.selectedForm = matched;
  }

  private resolveStatus(status: string): { text: string; tone: StatusTone } {
    const value = (status ?? '').toLowerCase();
    if (value.includes('resubmit')) {
      return { text: 'Resubmitted', tone: 'resubmitted' };
    }
    if (value.includes('shortlist')) {
      return { text: 'Shortlisted', tone: 'shortlisted' };
    }
    if (
      value.includes('compliance') ||
      value.includes('complaince') ||
      value.includes('directive')
    ) {
      return { text: 'Directive Issued', tone: 'directive' };
    }
    if (value.includes('reject')) {
      return { text: 'Rejected', tone: 'rejected' };
    }
    return { text: 'Pending Review', tone: 'pending' };
  }

  private getProgrammeName(item: Application): string {
    if (
      typeof item.department === 'string' &&
      item.department.trim().length > 0
    ) {
      return item.department;
    }
    if (item.department && typeof item.department !== 'string') {
      return item.department.name ?? 'N/A';
    }
    return item.program?.name ?? 'N/A';
  }

  private formatDate(input: string): string {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      return input;
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date);
  }

  isSelected(rowId: number): boolean {
    return this.selectedApplicantIds.includes(rowId);
  }

  toggleRowSelection(rowId: number, checked: boolean): void {
    if (checked && !this.isSelected(rowId)) {
      this.selectedApplicantIds.push(rowId);
      return;
    }
    this.selectedApplicantIds = this.selectedApplicantIds.filter(
      (id) => id !== rowId,
    );
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedApplicantIds = this.filteredRows.map((row) => row.id);
      return;
    }
    this.selectedApplicantIds = [];
  }

  allRowsSelected(): boolean {
    return (
      this.filteredRows.length > 0 &&
      this.filteredRows.every((row) =>
        this.selectedApplicantIds.includes(row.id),
      )
    );
  }

  onSelectionChange(rows: ApplicationListRow[] | null): void {
    this.selectedRows = rows ?? [];
    this.selectedApplicantIds = this.selectedRows.map((row) => row.id);
  }

  viewProfile(row: ApplicationListRow) {
    this.selectedApplicationNo = row.application_no;
    this.isApplicantDrawerVisible = true;
  }

  isViewActionDisabled(row: ApplicationListRow): boolean {
    return row.status_tone === 'rejected';
  }

  isShortlistActionDisabled(row: ApplicationListRow): boolean {
    return (
      row.status_tone === 'shortlisted' ||
      row.status_tone === 'directive' ||
      row.status_tone === 'rejected'
    );
  }

  isComplianceActionDisabled(row: ApplicationListRow): boolean {
    return row.status_tone === 'directive' || row.status_tone === 'rejected';
  }

  closeApplicantDrawer() {
    this.isApplicantDrawerVisible = false;
    this.selectedApplicationNo = null;
  }

  shortlistSingle(row: ApplicationListRow) {
    this.performApplicantAction(
      this.applicationService.shortlistApplicants({
        applicant_ids: [row.id],
      }),
      'Candidate shortlisted successfully.',
    );
  }

  shortlistSelected() {
    if (this.selectedApplicantIds.length === 0) {
      return;
    }
    this.performApplicantAction(
      this.applicationService.shortlistApplicants({
        applicant_ids: this.selectedApplicantIds,
      }),
      'Candidates shortlisted successfully.',
    );
  }

  openComplianceForSingle(row: ApplicationListRow) {
    this.pendingDirectiveApplicantIds = [row.id];
    this.reasonModalPrompt = `Issue compliance directive to ${row.full_name}?`;
    this.directiveSelectedReason = '';
    this.directiveSelectedDocuments = [];
    this.reasonModalInitialNote = '';
    this.isReasonModalVisible = true;
  }

  openComplianceForSelected() {
    if (this.selectedApplicantIds.length === 0) {
      return;
    }
    this.pendingDirectiveApplicantIds = [...this.selectedApplicantIds];
    this.reasonModalPrompt = `Issue compliance directive to ${this.selectedApplicantIds.length} selected candidate(s)?`;
    this.directiveSelectedReason = '';
    this.directiveSelectedDocuments = [];
    this.reasonModalInitialNote = '';
    this.isReasonModalVisible = true;
  }

  closeReasonModal() {
    this.isReasonModalVisible = false;
    this.pendingDirectiveApplicantIds = [];
    this.reasonModalInitialNote = '';
  }

  submitReasonModalPayload(payload: ActionModalPayload) {
    if (this.pendingDirectiveApplicantIds.length === 0) {
      window.alert('Applicant ID not found for this action.');
      return;
    }

    this.isReasonActionLoading = true;
    const requestPayload: ComplianceDirectivePayload = {
      applicant_ids: this.pendingDirectiveApplicantIds,
      extra_note: this.composeDirectiveNote(payload),
    };
    this.performApplicantAction(
      this.applicationService.issueComplianceDirective(requestPayload),
      'Compliance directive issued successfully.',
      () => this.closeReasonModal(),
    );
  }

  private composeDirectiveNote(payload: ActionModalPayload): string {
    const lines: string[] = [];
    if (payload.reason) {
      lines.push(`Reason: ${payload.reason}`);
    }
    if (payload.affectedDocuments.length > 0) {
      lines.push(`Affected Documents: ${payload.affectedDocuments.join(', ')}`);
    }
    if (payload.note) {
      lines.push(`Additional Notes: ${payload.note}`);
    }
    return lines.join('\n');
  }

  private performApplicantAction(
    request: import('rxjs').Observable<unknown>,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    this.busyService.show();
    request.subscribe({
      next: () => {
        onSuccess?.();
        window.alert(successMessage);
        this.selectedApplicantIds = [];
        this.fetchRecords();
      },
      error: (err) => {
        const message =
          err?.error?.message || err?.error?.detail || 'Action failed.';
        window.alert(message);
      },
      complete: () => {
        this.isReasonActionLoading = false;
        this.busyService.hide();
      },
    });
  }
}

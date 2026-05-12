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
  AdmissionAdminDashboardResponse,
  ApplicationService,
  ApplicationSetupItem,
  GetApplicantsQuery,
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
import { NotificationService } from '../../services/notification.service';
import {
  StatusIndicatorComponent,
  StatusTone,
} from '../../widgets/status-indicator/status-indicator.component';
import { SearchInputComponent } from '../../widgets/search-input/search-input.component';
import { TableRowActionsComponent } from '../../widgets/table-row-actions/table-row-actions.component';
import { ApplicantdetailComponent } from '../applicants/applicantdetail/applicantdetail.component';
import { AdmissionsUploadFlowComponent } from './upload-flow/admissions-upload-flow.component';
import { MetricCardComponent } from '../../widgets/metric-card/metric-card.component';
import { ChangeProgrammeModalComponent } from './change-programme-modal/change-programme-modal.component';
import { ButtonComponent } from '../../widgets/button/button.component';
import {
  UpdateFileModalComponent,
  UpdateFileSelection,
} from '../../widgets/update-file-modal/update-file-modal.component';

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

interface AdmissionFilterCard {
  label: string;
  filter: AdmissionDecisionFilter;
}

interface ProgrammeOption {
  label: string;
  value: number;
  programmeName: string;
}

interface ChangeProgrammeSelection {
  programmeName: string;
  applicationId: number;
}

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
    MetricCardComponent,
    ChangeProgrammeModalComponent,
    ButtonComponent,
    UpdateFileModalComponent,
  ],
  templateUrl: './admissions.component.html',
  styleUrl: './admissions.component.scss',
})
export class AdmissionsComponent implements OnInit, OnDestroy {
  _applicationService = inject(ApplicationService);
  router = inject(Router);
  busyService = inject(BusyIndicatorService);
  notification = inject(NotificationService);
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
  nextPageUrl: string | null = null;
  prevPageUrl: string | null = null;
  first = 0;

  rows = 100;

  searchText = '';
  selectedRows: AdmissionTableRow[] = [];
  selectedApplicationNo: string | null = null;
  isApplicantDrawerVisible = false;
  hasCheckedCbtUploadStatus = false;
  isCbtResultsUploaded = false;
  isUpdateFileModalVisible = false;
  isUpdatingWithFile = false;
  readonly updateFileFields = [
    { label: 'Approval Status', value: 'approval_status' },
    { label: 'Post UTME Point', value: 'post_utme_point' },
    { label: 'Approved Department Name', value: 'approved_department_name' },
  ];
  isChangeProgrammeModalVisible = false;
  isChangingProgramme = false;
  isLoadingProgrammeOptions = false;
  changeProgrammeCurrentProgramme = 'N/A';
  changeProgrammeApplicationNo = '';
  changeProgrammeApplicantId: number | null = null;
  changeProgrammeApplicantIds: number[] = [];
  programmeCatalog: ProgrammeOption[] = [];
  changeProgrammeOptions: ProgrammeOption[] = [];
  activeCardFilter: AdmissionDecisionFilter = 'all';
  readonly filterCards: AdmissionFilterCard[] = [
    { label: 'All Candidates', filter: 'all' },
    { label: 'Shortlisted', filter: 'pending-review' },
    { label: 'Pending Publish', filter: 'pending-publish' },
    { label: 'Admitted Candidates', filter: 'admitted' },
  ];
  metrics: AdmissionAdminDashboardResponse = {
    total_applicants: 0,
    total_pending: 0,
    pending_publish: 0,
    total_approved: 0,
    total_admitted: 0,
  };
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
          this.nextPageUrl = data.next_page_url ?? null;
          this.prevPageUrl = data.prev_page_url ?? null;
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
    this.checkCbtUploadStatus();
    this.loadProgrammeCatalog();
    this.loadCardMetrics();
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
      this.nextPageUrl = data.next_page_url ?? null;
      this.prevPageUrl = data.prev_page_url ?? null;
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

  get shouldShowPagination(): boolean {
    return !!this.nextPageUrl || !!this.prevPageUrl;
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
        this.nextPageUrl = data.next_page_url ?? null;
        this.prevPageUrl = data.prev_page_url ?? null;
        this.applicationList = data.data;
        this.populateSummary();
      },
    );
  }

  private fetchRecords(
    sortField?: string,
    sortOrder?: number,
  ): Observable<ApplicationListResponse> {
    const query: GetApplicantsQuery = {
      search: this.searchKeyword,
      approval_status: this.getApprovalStatusForCardFilter(
        this.activeCardFilter,
      ),
    };

    return this._applicationService.getapplications(
      undefined,
      this.rows,
      this.first + 1,
      sortField,
      sortOrder,
      query,
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
        this.nextPageUrl = data.next_page_url ?? null;
        this.prevPageUrl = data.prev_page_url ?? null;
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
    if (
      value.includes('admitted internally') ||
      value.includes('admit internally') ||
      value.includes('pending publish') ||
      value.includes('publish')
    ) {
      return {
        text: 'Pending Publish',
        tone: 'resubmitted',
        category: 'pending-publish',
      };
    }
    if (value.includes('shortlist')) {
      return {
        text: 'Shortlisted',
        tone: 'shortlisted',
        category: 'pending-review',
      };
    }
    if (value.includes('admit') || value.includes('approved')) {
      return { text: 'Admitted', tone: 'shortlisted', category: 'admitted' };
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
    this.first = 0;
    this.selectedRows = [];
    this.loadAdmissionsRecords();
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

  private getApprovalStatusForCardFilter(
    filter: AdmissionDecisionFilter,
  ): string | undefined {
    if (filter === 'all') {
      return undefined;
    }
    if (filter === 'pending-review') {
      return 'shortlisted';
    }
    if (filter === 'pending-publish') {
      return 'admitted_internally';
    }
    if (filter === 'admitted') {
      return 'admitted';
    }
    return undefined;
  }

  getCardCount(filter: AdmissionDecisionFilter): number {
    const metrics = this.metrics;

    if (filter === 'all') {
      return metrics.total_applicants || this.total_record_count;
    }
    if (filter === 'pending-review') {
      return metrics.total_pending ?? 0;
    }
    if (filter === 'pending-publish') {
      return metrics.pending_publish ?? 0;
    }
    if (filter === 'admitted') {
      return metrics.total_admitted ?? 0;
    }
    return 0;
  }

  viewProfile(row: AdmissionTableRow) {
    this.selectedApplicationNo = row.application_no;
    this.isApplicantDrawerVisible = true;
  }

  closeApplicantDrawer() {
    this.isApplicantDrawerVisible = false;
    this.selectedApplicationNo = null;
  }

  openDocumentUploadFlow(): void {
    this.isUpdateFileModalVisible = true;
  }

  closeUpdateFileModal(): void {
    this.isUpdateFileModalVisible = false;
  }

  submitUpdateWithFile(selection: UpdateFileSelection): void {
    this.isUpdatingWithFile = true;
    this._applicationService
      .bulkUpdateApplicants({
        file: selection.file,
        fields: selection.fields.join(','),
      })
      .subscribe({
        next: () => {
          this.notification.success('Applicants updated successfully.');
          this.isUpdateFileModalVisible = false;
          this.loadCardMetrics();
          this.loadAdmissionsRecords();
        },
        error: () => {
          this.isUpdatingWithFile = false;
        },
        complete: () => {
          this.isUpdatingWithFile = false;
        },
      });
  }

  onCbtUploadFlowCompleted(): void {
    this.isCbtResultsUploaded = true;
    this.loadCardMetrics();
    this.loadAdmissionsRecords();
  }

  grantAdmissionFromTable(row: AdmissionTableRow): void {
    if (this.isPendingPublishDecision(row)) {
      this.revertDecision(row);
      return;
    }
    this.performApplicantAction(
      this._applicationService.markAsAdmittedInternally({
        data: [{ applicant_id: row.id }],
      }),
      `Admission granted for ${row.full_name}.`,
    );
  }

  grantAdmissionForSelected(): void {
    const eligibleRows = this.getBulkEligibleRows();
    if (eligibleRows.length === 0) {
      this.notification.warn(
        'Select at least one non-admitted candidate to grant admission.',
      );
      return;
    }

    this.notifySkippedBulkRows(eligibleRows.length);
    this.performApplicantAction(
      this._applicationService.markAsAdmittedInternally({
        data: eligibleRows.map((row) => ({ applicant_id: row.id })),
      }),
      this.buildBulkSuccessMessage(
        'Admission granted',
        eligibleRows.length,
        'candidate',
      ),
    );
  }

  grantAdmissionFromDrawer(): void {
    if (!this.selectedApplicationNo) {
      return;
    }
    const row = this.findRowByApplicationNo(this.selectedApplicationNo);
    if (!row) {
      this.notification.error('Unable to resolve selected applicant record.');
      return;
    }
    this.grantAdmissionFromTable(row);
  }

  changeProgrammeFromTable(row: AdmissionTableRow): void {
    this.openChangeProgrammeModal(row.application_no, row.program);
  }

  openChangeProgrammeForSelected(): void {
    const eligibleRows = this.getBulkEligibleRows();
    if (eligibleRows.length === 0) {
      this.notification.warn(
        'Select at least one non-admitted candidate to change programme.',
      );
      return;
    }

    this.closeTransientOverlays();
    this.notifySkippedBulkRows(eligibleRows.length);
    this.changeProgrammeApplicationNo = `${eligibleRows.length} selected candidates`;
    this.changeProgrammeCurrentProgramme =
      eligibleRows.length === 1
        ? eligibleRows[0].program
        : 'Multiple programmes';
    this.changeProgrammeApplicantId = eligibleRows[0]?.id ?? null;
    this.changeProgrammeApplicantIds = eligibleRows.map((row) => row.id);
    this.prepareChangeProgrammeOptions(this.changeProgrammeCurrentProgramme);
  }

  openChangeProgrammeFromDrawer(currentProgramme: string): void {
    if (!this.selectedApplicationNo) {
      this.notification.error(
        'Application number is required for this action.',
      );
      return;
    }
    this.openChangeProgrammeModal(this.selectedApplicationNo, currentProgramme);
  }

  closeChangeProgrammeModal(): void {
    this.isChangeProgrammeModalVisible = false;
    this.changeProgrammeApplicantId = null;
    this.changeProgrammeApplicantIds = [];
  }

  submitChangeProgramme(selection: ChangeProgrammeSelection): void {
    if (this.changeProgrammeApplicantIds.length === 0) {
      this.notification.error(
        'Applicant record is required to change programme.',
      );
      return;
    }

    const normalizedSelection =
      this.normalizeChangeProgrammeSelection(selection);
    if (!normalizedSelection) {
      this.notification.error(
        'Select a valid programme before submitting this action.',
      );
      return;
    }

    this.isChangingProgramme = true;
    this.busyService.show();
    this._applicationService
      .markAsAdmittedInternally({
        data: this.changeProgrammeApplicantIds.map((applicantId) => ({
          applicant_id: applicantId,
          application_id: normalizedSelection.applicationId,
        })),
      })
      .subscribe({
        next: () => {
          this.notification.success(
            this.changeProgrammeApplicantIds.length === 1
              ? `Programme changed to ${normalizedSelection.programmeName} for ${this.changeProgrammeApplicationNo}.`
              : `${this.changeProgrammeApplicantIds.length} candidates moved to ${normalizedSelection.programmeName}.`,
          );
          this.isChangeProgrammeModalVisible = false;
          this.loadCardMetrics();
          this.fetchRecords().subscribe((data: ApplicationListResponse) => {
            this.total_record_count = data.total;
            this.nextPageUrl = data.next_page_url ?? null;
            this.prevPageUrl = data.prev_page_url ?? null;
            this.applicationList = data.data;
            this.populateSummary();
          });
        },
        error: () => {
          this.isChangingProgramme = false;
          this.busyService.hide();
        },
        complete: () => {
          this.isChangingProgramme = false;
          this.busyService.hide();
        },
      });
  }

  private openChangeProgrammeModal(
    applicationNo: string,
    currentProgramme: string,
  ): void {
    this.closeTransientOverlays();
    this.changeProgrammeApplicationNo = applicationNo;
    this.changeProgrammeCurrentProgramme = currentProgramme || 'N/A';
    const row = this.findRowByApplicationNo(applicationNo);
    this.changeProgrammeApplicantId = row?.id ?? null;
    this.changeProgrammeApplicantIds = row?.id ? [row.id] : [];
    this.prepareChangeProgrammeOptions(currentProgramme);
  }

  private buildProgrammeOptionsFromApplicants(): ProgrammeOption[] {
    const seeded = this.applicationList
      .map((application) => {
        if (application.program?.id && application.program?.name) {
          return {
            label: application.program.name,
            value: application.program.id,
            programmeName: application.program.name,
          };
        }
        return null;
      })
      .filter((value): value is ProgrammeOption => value !== null);

    const merged = Array.from(
      new Map(seeded.map((option) => [option.value, option])).values(),
    );

    return merged;
  }

  private filterProgrammeOptions(currentProgramme: string): ProgrammeOption[] {
    const normalizedCurrent = (currentProgramme ?? '').trim().toLowerCase();
    const source =
      this.programmeCatalog.length > 0
        ? this.programmeCatalog
        : this.buildProgrammeOptionsFromApplicants();

    return source.filter(
      (value) => value.programmeName.trim().toLowerCase() !== normalizedCurrent,
    );
  }

  private prepareChangeProgrammeOptions(currentProgramme: string): void {
    if (this.programmeCatalog.length > 0) {
      this.applyChangeProgrammeOptions(currentProgramme);
      return;
    }

    this.loadProgrammeCatalog(() =>
      this.applyChangeProgrammeOptions(currentProgramme),
    );
  }

  private applyChangeProgrammeOptions(currentProgramme: string): void {
    this.changeProgrammeOptions = this.filterProgrammeOptions(currentProgramme);
    if (this.changeProgrammeOptions.length === 0) {
      this.notification.warn(
        'No programme options available for change programme.',
      );
    }
    this.isChangeProgrammeModalVisible = true;
  }

  private loadProgrammeCatalog(onLoaded?: () => void): void {
    this.isLoadingProgrammeOptions = true;
    this._applicationService.getAvailableApplications().subscribe({
      next: (response) => {
        const parsedOptions = this.parseProgrammeOptions(response.data ?? []);
        this.programmeCatalog =
          parsedOptions.length > 0
            ? parsedOptions
            : this.buildProgrammeOptionsFromApplicants();
      },
      error: () => {
        this.programmeCatalog = this.buildProgrammeOptionsFromApplicants();
        this.notification.warn(
          'Unable to load application programmes. Using available programme options.',
        );
      },
      complete: () => {
        this.isLoadingProgrammeOptions = false;
        onLoaded?.();
      },
    });
  }

  private parseProgrammeOptions(
    applications: ApplicationSetupItem[],
  ): ProgrammeOption[] {
    const normalizedOptions = applications
      .map((item) => {
        if (!item?.id || !item.program?.name) {
          return null;
        }

        const programmeName = item.program.name.trim();
        const levelName = item.level?.name?.trim();
        const label = levelName
          ? `${programmeName} (${levelName})`
          : programmeName;

        return {
          label,
          value: item.id,
          programmeName,
        };
      })
      .filter((value): value is ProgrammeOption => value !== null);

    return Array.from(
      new Map(
        normalizedOptions.map((option) => [option.value, option]),
      ).values(),
    );
  }

  private closeTransientOverlays(): void {
    this.isChangeProgrammeModalVisible = false;
    this.changeProgrammeApplicantId = null;
    this.changeProgrammeApplicantIds = [];
    this.changeProgrammeOptions = [];
    this.isApplicantDrawerVisible = false;
    this.selectedApplicationNo = null;
  }

  get canBulkGrantAdmission(): boolean {
    return this.getBulkEligibleRows().length > 0;
  }

  get canBulkChangeProgramme(): boolean {
    return this.getBulkEligibleRows().length > 0;
  }

  get showPublishAdmissionButton(): boolean {
    return this.activeCardFilter === 'pending-publish';
  }

  get canPublishAdmissions(): boolean {
    return this.getPublishableRows().length > 0;
  }

  private getBulkEligibleRows(): AdmissionTableRow[] {
    return this.selectedRows.filter(
      (row) => row.decision_category !== 'admitted',
    );
  }

  publishAdmissions(): void {
    const publishableRows = this.getPublishableRows();
    if (publishableRows.length === 0) {
      this.notification.warn('No pending publish candidates available.');
      return;
    }

    this.performApplicantAction(
      this._applicationService.approveApplicants({
        data: publishableRows.map((row) => ({
          applicant_id: row.id,
        })),
      }),
      this.buildBulkSuccessMessage(
        'Admission published',
        publishableRows.length,
        'candidate',
      ),
      true,
    );
  }

  private getPublishableRows(): AdmissionTableRow[] {
    const selectedPendingPublishRows = this.selectedRows.filter((row) =>
      this.isPendingPublishDecision(row),
    );
    if (selectedPendingPublishRows.length > 0) {
      return selectedPendingPublishRows;
    }
    return this.filteredRows.filter((row) =>
      this.isPendingPublishDecision(row),
    );
  }

  private notifySkippedBulkRows(processedCount: number): void {
    const skippedCount = this.selectedRows.length - processedCount;
    if (skippedCount > 0) {
      this.notification.warn(
        `${skippedCount} admitted candidate${skippedCount === 1 ? '' : 's'} skipped.`,
      );
    }
  }

  private buildBulkSuccessMessage(
    actionLabel: string,
    count: number,
    noun: string,
  ): string {
    const suffix = count === 1 ? noun : `${noun}s`;
    return `${actionLabel} for ${count} ${suffix}.`;
  }

  private normalizeChangeProgrammeSelection(
    selection: ChangeProgrammeSelection,
  ): ChangeProgrammeSelection | null {
    if (!selection?.applicationId || !selection.programmeName) {
      return null;
    }

    return selection;
  }

  getDecisionActionTooltip(row: AdmissionTableRow): string {
    return this.isPendingPublishDecision(row)
      ? 'Revert Decision'
      : 'Grant Admission';
  }

  getDecisionActionIcon(row: AdmissionTableRow): string {
    return this.isPendingPublishDecision(row)
      ? 'bi bi-arrow-counterclockwise'
      : 'bi bi-check';
  }

  isGrantAdmissionActionDisabled(row: AdmissionTableRow): boolean {
    return row.decision_category === 'admitted';
  }

  isChangeProgrammeActionDisabled(row: AdmissionTableRow): boolean {
    return row.decision_category === 'admitted';
  }

  private isPendingPublishDecision(row: AdmissionTableRow): boolean {
    return row.decision_category === 'pending-publish';
  }

  private revertDecision(row: AdmissionTableRow): void {
    this.notification.warn(
      `Revert decision is not yet wired for ${row.full_name}.`,
    );
  }

  private findRowByApplicationNo(
    applicationNo: string,
  ): AdmissionTableRow | undefined {
    return this.app_summ.find((row) => row.application_no === applicationNo);
  }

  private performApplicantAction(
    request: Observable<unknown>,
    successMessage: string,
    refreshMetrics = true,
  ) {
    this.busyService.show();
    request.subscribe({
      next: () => {
        this.notification.success(successMessage);
        this.selectedRows = [];
        if (refreshMetrics) {
          this.loadCardMetrics();
        }
        this.fetchRecords().subscribe((data: ApplicationListResponse) => {
          this.total_record_count = data.total;
          this.nextPageUrl = data.next_page_url ?? null;
          this.prevPageUrl = data.prev_page_url ?? null;
          this.applicationList = data.data;
          this.populateSummary();
        });
      },
      complete: () => {
        this.busyService.hide();
      },
    });
  }

  private checkCbtUploadStatus(): void {
    this._applicationService.getCbtResultsUploaded().subscribe({
      next: (response: unknown) => {
        this.isCbtResultsUploaded = this.resolveCbtUploadStatus(response);
        if (this.isCbtResultsUploaded) {
          this.loadAdmissionsRecords();
        }
      },
      error: () => {
        this.isCbtResultsUploaded = true;
        this.notification.warn(
          'Unable to verify CBT upload status. Showing admissions list.',
        );
        this.loadAdmissionsRecords();
      },
      complete: () => {
        this.hasCheckedCbtUploadStatus = true;
      },
    });
  }

  private loadAdmissionsRecords(): void {
    this.busyService.show();
    this.fetchRecords().subscribe((data: ApplicationListResponse) => {
      this.total_record_count = data.total;
      this.nextPageUrl = data.next_page_url ?? null;
      this.prevPageUrl = data.prev_page_url ?? null;
      this.applicationList = data.data;
      this.populateSummary();
      this.busyService.hide();
    });
  }

  private loadCardMetrics(): void {
    this._applicationService.getAdmissionAdminDashboard().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
      },
    });
  }

  private resolveCbtUploadStatus(response: unknown): boolean {
    if (typeof response === 'boolean') {
      return response;
    }
    if (response && typeof response === 'object') {
      const maybeObject = response as Record<string, unknown>;
      if (typeof maybeObject['cbt_results_uploaded'] === 'boolean') {
        return maybeObject['cbt_results_uploaded'] as boolean;
      }
      const candidates = [
        maybeObject['uploaded'],
        maybeObject['is_uploaded'],
        maybeObject['cbt_results_uploaded'],
        maybeObject['status'],
        maybeObject['data'],
      ];
      for (const value of candidates) {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          if (normalized === 'true' || normalized === 'uploaded') {
            return true;
          }
          if (normalized === 'false' || normalized === 'not_uploaded') {
            return false;
          }
        }
      }
    }
    return false;
  }

  get showEmptyState(): boolean {
    return this.hasCheckedCbtUploadStatus && !this.isCbtResultsUploaded;
  }
}

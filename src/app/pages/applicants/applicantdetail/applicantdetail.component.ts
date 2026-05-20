import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ApplicationService,
  ComplianceDirectivePayload,
  RejectApplicantPayload,
} from '../../../services/application.service';
import { NotificationService } from '../../../services/notification.service';
import {
  AcademicHistory,
  Application,
  ApplicationListResponse,
  Certificate,
  OLevelResult,
} from '../../../model/dashboard/applicant';
import { TabViewModule } from 'primeng/tabview';
import {
  ReusableTableColumn,
  ReusableTableComponent,
} from '../../../widgets/reusable-table/reusable-table.component';
import { Observable } from 'rxjs';
import { ActionNoteModalComponent } from '../../../widgets/action-note-modal/action-note-modal.component';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { getApplicationStatusDefinition } from '../../../constants/application-status.utils';
import { ApplicationStatusDefinition } from '../../../constants/application-status.types';

type ApplicantDocumentFile =
  | Certificate
  | {
      file_url: string;
      file_name: string;
      file_size: number;
      file_type: string;
    };

@Component({
  selector: 'app-applicantdetail',
  imports: [
    CommonModule,
    RouterModule,
    TabViewModule,
    ReusableTableComponent,
    ActionNoteModalComponent,
    ButtonComponent,
  ],
  templateUrl: './applicantdetail.component.html',
  styleUrl: './applicantdetail.component.scss',
})
export class ApplicantdetailComponent implements OnInit, OnChanges {
  private readonly rejectAction = 'reject';
  private readonly complianceAction = 'compliance';
  _applicationservice = inject(ApplicationService);
  notification = inject(NotificationService);
  application: Application = {} as Application;
  route = inject(ActivatedRoute);

  @Input() applicationNo: string | null = null;
  @Input() embedded = false;
  @Input() embeddedMode: 'default' | 'admissions' = 'default';
  @Output() closed = new EventEmitter<void>();
  @Output() changeProgrammeRequested = new EventEmitter<string>();
  @Output() grantAdmissionRequested = new EventEmitter<void>();
  @Output() actionCompleted = new EventEmitter<void>();

  app_no: string | null = '';
  isIssuingCompliance = false;
  isRejecting = false;
  isShortlisting = false;
  isReasonModalVisible = false;
  isReasonActionLoading = false;
  reasonModalTitle = '';
  reasonModalPrompt = '';
  reasonModalConfirmLabel = '';
  reasonModalInitialNote = '';
  pendingReasonAction: 'reject' | 'compliance' | null = null;
  detailColumns: ReusableTableColumn[] = [
    { field: 'label', cellClass: 'fw-bold' },
    { field: 'value' },
  ];
  documentColumns: ReusableTableColumn[] = [
    { field: 'label', cellClass: 'fw-bold' },
    { field: 'file' },
    { field: 'actions' },
  ];
  personalDetailRows: Record<string, unknown>[] = [];
  nextOfKinRows: Record<string, unknown>[] = [];
  documentRows: Record<string, unknown>[] = [];
  oLevelResults: OLevelResult[] = [];
  otherQualifications: AcademicHistory[] = [];
  primaryAcademicHistory: AcademicHistory | null = null;
  secondaryAcademicHistory: AcademicHistory | null = null;

  onChangeProgramme(): void {
    if (this.embeddedMode === 'admissions') {
      const department = this.application?.department;
      const departmentName =
        typeof department === 'string' ? department : (department?.name ?? '');
      const programme = this.application?.program?.name || departmentName || '';
      this.changeProgrammeRequested.emit(programme);
      return;
    }
    this.notification.warn('Change programme action is not yet wired.');
  }

  onGrantAdmission(): void {
    if (this.embeddedMode === 'admissions') {
      this.grantAdmissionRequested.emit();
      return;
    }
    this.notification.warn('Grant admission action is not yet wired.');
  }

  getDetailPairRows(rows: Record<string, unknown>[]): {
    leftLabel: string;
    leftValue: string;
    rightLabel?: string;
    rightValue?: string;
  }[] {
    const pairRows: {
      leftLabel: string;
      leftValue: string;
      rightLabel?: string;
      rightValue?: string;
    }[] = [];

    for (let index = 0; index < rows.length; index += 2) {
      const left = rows[index];
      const right = rows[index + 1];

      pairRows.push({
        leftLabel: this.getDisplayText(left?.['label']),
        leftValue: this.getDisplayText(left?.['value']),
        rightLabel: this.getDisplayText(right?.['label'], ''),
        rightValue: this.getDisplayText(right?.['value'], ''),
      });
    }

    return pairRows;
  }

  private getDisplayText(value: unknown, fallback = '-----'): string {
    if (value === null || value === undefined) {
      return fallback;
    }
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  ngOnInit(): void {
    this.loadApplication();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['applicationNo'] && !changes['applicationNo'].firstChange) {
      this.loadApplication();
    }
  }

  private loadApplication(): void {
    const rawApplicationNo =
      this.applicationNo ?? this.route.snapshot.paramMap.get('appno');
    if (!rawApplicationNo) {
      return;
    }

    this.app_no = rawApplicationNo.replaceAll('_', '/');
    this._applicationservice
      .getapplication(this.app_no!)
      .subscribe((response: ApplicationListResponse | Application) => {
        const applicant = this.resolveApplicantFromResponse(response);
        if (!applicant) {
          return;
        }
        this.application = applicant;
        this.buildDetailRows();
      });
  }

  private resolveApplicantFromResponse(
    response: ApplicationListResponse | Application,
  ): Application | null {
    if (response && typeof response === 'object' && 'data' in response) {
      if (Array.isArray(response.data)) {
        return response.data.length > 0 ? response.data[0] : null;
      }
      if (
        response.data &&
        typeof response.data === 'object' &&
        'application_no' in response.data
      ) {
        return response.data as unknown as Application;
      }
      return null;
    }
    return response ?? null;
  }

  getAcademicHistory(name: string): AcademicHistory | undefined {
    const academicHistory = this.application.academic_history ?? [];
    if (name === 'primary') {
      return academicHistory.filter(
        (historyItem) =>
          historyItem.certificate_type === 'Primary School Leaving Certificate',
      )[0];
    }
    if (name === 'secondary') {
      return academicHistory.filter(
        (historyItem) => historyItem.certificate_type === 'SSSCE',
      )[0];
    }
    return undefined;
  }
  getYear(): number | null {
    const input = this.application.o_level_result![0].name;
    const yearMatches = input.match(/\b(20\d{2}|19\d{2})\b/g);

    if (!yearMatches || yearMatches.length === 0) {
      // Try matching 2-digit years (like '25 in "sscc/2025")
      const shortYearMatch = input.match(/\b\d{2}\b/);
      if (shortYearMatch) {
        const shortYear = parseInt(shortYearMatch[0]);
        // Assuming years 00-79 are 2000-2079, 80-99 are 1980-1999
        return shortYear >= 80 ? 1900 + shortYear : 2000 + shortYear;
      }
      return null;
    }

    // Convert all matches to numbers and return the largest (most recent) one
    const years = yearMatches.map((match) => parseInt(match));
    return Math.max(...years);
  }

  getExamName(): string {
    const input = this.application.o_level_result![0].name;
    let text = input
      .replace(/\s*\b(20\d{2}|19\d{2})\b\s*/g, ' ') // Remove 4-digit years
      .replace(/\s*\b\d{2}\b\s*/g, ' ') // Remove 2-digit years
      .replace(/\s*\/\s*\d+\s*/g, ' ') // Remove /2025, /23, etc.
      .trim();

    // Step 2: Clean up extra spaces and dangling punctuation
    text = text
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/\s*-\s*/g, ' ') // Remove standalone hyphens
      .replace(/\s*,\s*$/, '') // Remove trailing commas
      .replace(/\s*\)\s*/g, ' ') // Remove standalone closing parentheses
      .replace(/\s*\(\s*/g, ' ') // Remove standalone opening parentheses
      .trim();

    // Step 3: Preserve acronyms in parentheses (e.g., "(WASSCE)") but clean the rest
    const acronymRegex = /\(([A-Z]+)\)/g;
    const acronyms: string[] = [];
    let match;
    while ((match = acronymRegex.exec(input)) !== null) {
      acronyms.push(match[1]);
    }

    // Reattach acronyms if they existed (e.g., "WEST AFRICAN... (WASSCE)")
    if (acronyms.length > 0) {
      text = text.replace(/\s*\([^)]*\)\s*/g, ''); // Remove all parentheses content
      text = `${text} (${acronyms.join(') (')})`; // Re-add only the acronyms
    }

    return text || input; // Fallback to original if empty
  }

  getfileName(fileobj: ApplicantDocumentFile | null | undefined): string {
    let extension = '';

    if (!fileobj) return '';
    if (fileobj.file_type) {
      const typeParts = fileobj.file_type.split('/');
      if (typeParts.length > 1) {
        extension = typeParts[1];
      }
    }

    if (!extension && fileobj.file_url) {
      const urlParts = fileobj.file_url.split('.');
      if (urlParts.length > 1) {
        extension = urlParts[urlParts.length - 1].split(/[?#]/)[0];
      }
    }

    let fileName = fileobj.file_name.trim();
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      // Remove existing extension if present
      fileName = fileName.substring(0, lastDotIndex);
    }

    return extension ? `${fileName}.${extension}` : fileName;
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Handle cases where we might get -0 or similar
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${value} ${sizes[i]}`;
  }

  getDocumentFile(row: Record<string, unknown>) {
    const file = row['file'] as ApplicantDocumentFile | undefined;
    return file ?? null;
  }

  private formatAddressDisplay(): string {
    const residentialAddress = this.application.residential_address;
    if (!residentialAddress) {
      return '-----';
    }

    const addressParts = [
      residentialAddress.address,
      residentialAddress.lga?.name,
      residentialAddress.state?.name,
    ]
      .map((addressPart) => addressPart?.trim() ?? '')
      .filter((addressPart) => addressPart.length > 0);

    return addressParts.length > 0 ? addressParts.join(', ') : '-----';
  }

  viewDocument(row: Record<string, unknown>): void {
    const file = this.getDocumentFile(row);
    const fileUrl = this.getDocumentUrl(file);

    if (!fileUrl) {
      this.notification.warn('This document is not available to view.');
      return;
    }

    const openedWindow = window.open(fileUrl, '_blank', 'noopener,noreferrer');
    if (!openedWindow) {
      this.notification.warn('Unable to open this document right now.');
    }
  }

  downloadDocument(row: Record<string, unknown>): void {
    const file = this.getDocumentFile(row);
    const fileUrl = this.getDocumentUrl(file);

    if (!fileUrl) {
      this.notification.warn('This document is not available for download.');
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = this.getfileName(file) || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getDocumentUrl(
    file: ApplicantDocumentFile | null | undefined,
  ): string {
    return file?.file_url?.trim() ?? '';
  }

  formatValue(value: unknown, fallback = '-----'): string {
    return this.getDisplayText(value, fallback);
  }

  getJambScoreDisplay(): string {
    return this.formatValue(this.application.utme_result?.score);
  }

  getCbtScoreDisplay(): string {
    const applicationRecord = this.application as unknown as Record<
      string,
      unknown
    >;
    return this.formatValue(applicationRecord['post_utme_point'] || '0');
  }

  getUtmeRegistrationNumber(): string {
    const applicationRecord = this.application as unknown as Record<
      string,
      unknown
    >;
    return this.formatValue(applicationRecord['utme_reg_no']);
  }

  getOLevelPointDisplay(): string {
    return this.formatValue(this.application.o_level_point, '0');
  }

  getAttemptCountLabel(): string {
    const attemptCount = this.oLevelResults.length;
    return `${attemptCount} ${attemptCount === 1 ? 'Attempt' : 'Attempts'}`;
  }

  formatSubjectName(subjectName: string): string {
    const normalizedName = subjectName.trim().toLowerCase();
    const formattedNames: Record<string, string> = {
      english: 'English Language',
      math: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
    };

    return (
      formattedNames[normalizedName] ??
      normalizedName.replace(/\b\w/g, (character) => character.toUpperCase())
    );
  }

  formatDateRange(fromDate?: string, toDate?: string): string {
    const normalizedFromDate = this.formatValue(fromDate);
    const normalizedToDate = this.formatValue(toDate);
    return `${normalizedFromDate} to ${normalizedToDate}`;
  }

  issueComplianceDirective() {
    if (
      !this.application?.id ||
      this.isIssuingCompliance ||
      this.isComplianceIssued() ||
      this.isShortlistedForExam()
    ) {
      return;
    }
    this.openReasonModal(this.complianceAction);
  }

  shortlistApplicant() {
    if (
      !this.application?.id ||
      this.isShortlisting ||
      this.isShortlistedForExam() ||
      this.isComplianceStatus()
    ) {
      return;
    }
    this.performApplicantAction(
      this._applicationservice.shortlistApplicants({
        applicant_ids: [this.application.id],
      }),
      'Candidate shortlisted successfully.',
      () => {
        this.application.approval_status = 'shortlisted';
      },
      () => {
        this.isShortlisting = true;
      },
      () => {
        this.isShortlisting = false;
      },
    );
  }

  rejectApplicant() {
    if (!this.application?.id || this.isRejecting || this.isRejected()) {
      return;
    }
    this.openReasonModal(this.rejectAction);
  }

  openReasonModal(action: 'reject' | 'compliance') {
    const fullName =
      `${this.application.first_name} ${this.application.last_name}`.trim();
    this.pendingReasonAction = action;
    this.reasonModalTitle =
      action === this.complianceAction
        ? 'Issue Compliance Directive'
        : 'Reject Candidate';
    this.reasonModalPrompt =
      action === this.complianceAction
        ? `Do you want to issue compliance directive to ${fullName}?`
        : `Do you want to reject ${fullName}?`;
    this.reasonModalConfirmLabel =
      action === this.complianceAction ? 'Issue Directive' : 'Reject Candidate';
    this.reasonModalInitialNote =
      action === this.complianceAction
        ? (this.application.compliance_directive ?? '')
        : '';
    this.isReasonModalVisible = true;
  }

  closeReasonModal() {
    this.isReasonModalVisible = false;
    this.pendingReasonAction = null;
    this.reasonModalInitialNote = '';
  }

  submitReasonModal(note: string) {
    if (!this.application?.id || !this.pendingReasonAction) {
      this.notification.error('Applicant ID not found for this action.');
      return;
    }

    this.isReasonActionLoading = true;

    if (this.pendingReasonAction === this.complianceAction) {
      const payload: ComplianceDirectivePayload = {
        applicant_ids: [this.application.id],
        extra_note: note,
      };
      this.performApplicantAction(
        this._applicationservice.issueComplianceDirective(payload),
        'Compliance directive issued successfully.',
        () => {
          this.application.approval_status = 'compliance_required';
          this.application.compliance_directive = payload.extra_note;
          this.closeReasonModal();
        },
        () => {
          this.isIssuingCompliance = true;
        },
        () => {
          this.isIssuingCompliance = false;
        },
      );
      return;
    }

    const payload: RejectApplicantPayload = {
      applicant_ids: [this.application.id],
      extra_note: note,
    };

    this.performApplicantAction(
      this._applicationservice.rejectApplicants(payload),
      'Candidate rejected successfully.',
      () => {
        this.application.approval_status = 'rejected';
        this.closeReasonModal();
      },
      () => {
        this.isRejecting = true;
      },
      () => {
        this.isRejecting = false;
      },
    );
  }

  private performApplicantAction(
    request: Observable<unknown>,
    successMessage: string,
    onSuccess?: () => void,
    onStart?: () => void,
    onComplete?: () => void,
  ) {
    onStart?.();
    request.subscribe({
      next: () => {
        onSuccess?.();
        this.actionCompleted.emit();
        this.notification.success(successMessage);
      },

      complete: () => {
        this.isReasonActionLoading = false;
        onComplete?.();
      },
    });
  }

  private buildDetailRows() {
    const primaryHistory = this.getAcademicHistory('primary');
    const secondaryHistory = this.getAcademicHistory('secondary');
    const hasOLevelResults =
      Array.isArray(this.application.o_level_result) &&
      this.application.o_level_result.length > 0;

    this.primaryAcademicHistory = primaryHistory ?? null;
    this.secondaryAcademicHistory = secondaryHistory ?? null;
    this.oLevelResults = this.application.o_level_result ?? [];
    this.otherQualifications = (this.application.academic_history ?? []).filter(
      (item) => {
        const certificateType = (item.certificate_type ?? '')
          .trim()
          .toLowerCase();
        return (
          certificateType !== 'primary school leaving certificate' &&
          certificateType !== 'sssce'
        );
      },
    );

    this.personalDetailRows = [
      { label: 'First Name', value: this.application.first_name },
      { label: 'Last Name', value: this.application.last_name },
      { label: 'Middle Name', value: this.application.other_names },
      { label: 'Email Address', value: this.application.email },
      { label: 'Phone Number', value: this.application.phone_number },
      {
        label: 'Alternate Phone Number',
        value: this.application.alt_phone_number,
      },
      { label: 'Date of Birth', value: this.application.dob },
      { label: 'Gender', value: this.application.gender },
      { label: 'Marital Status', value: this.application.marital_status },
      { label: 'Nationality', value: this.application.nationality },
      { label: 'State of Origin', value: this.application.state_of_origin },
      { label: 'Local Government Area', value: this.application.lga },
      { label: 'Living with disability?', value: this.application.disability },
      { label: 'Specified disability', value: this.application.disability },
      {
        label: 'Address',
        value: this.formatAddressDisplay(),
      },
    ];

    this.nextOfKinRows = [
      {
        label: 'Title',
        value: this.application.primary_parent_or_guardian?.title,
      },
      {
        label: 'First Name',
        value: this.application.primary_parent_or_guardian?.first_name,
      },
      {
        label: 'Last Name',
        value: this.application.primary_parent_or_guardian?.last_name,
      },
      {
        label: 'Middle Name',
        value: this.application.primary_parent_or_guardian?.other_names,
      },
      {
        label: 'Email Address',
        value: this.application.primary_parent_or_guardian?.email,
      },
      {
        label: 'Phone Number',
        value: this.application.primary_parent_or_guardian?.phone_number,
      },
      {
        label: 'Gender',
        value: this.application.primary_parent_or_guardian?.gender,
      },
      {
        label: 'Occupation',
        value: this.application.primary_parent_or_guardian?.occupation,
      },
      {
        label: 'Nationality',
        value: this.application.primary_parent_or_guardian?.nationality,
      },
      {
        label: 'State of Origin',
        value: this.application.primary_parent_or_guardian?.state_of_origin,
      },
      {
        label: 'Local Government Area',
        value: this.application.primary_parent_or_guardian?.lga,
      },
      {
        label: 'Address',
        value: this.application.primary_parent_or_guardian?.residential_address,
      },
    ];

    this.documentRows = [
      {
        label: 'Cirtificate of Birth',
        file: this.application.certificate_of_birth ?? null,
        actions: 'View, Download',
      },
      {
        label: "O' Level",
        file: hasOLevelResults
          ? this.application.o_level_result?.[0]?.file
          : null,
        actions: 'View, Download',
      },
      {
        label: 'Certificate of Origin',
        file: this.application.certificate_of_origin ?? null,
        actions: 'View, Download',
      },
      {
        label: 'Passport Photograph',
        file: this.application.passport_photo ?? null,
        actions: 'View, Download',
      },
      {
        label: 'UTME Result',
        file: this.application.utme_result?.file ?? null,
        actions: 'View, Download',
      },
    ];
  }

  private getNormalizedApprovalStatus(): string {
    return (this.application?.approval_status ?? '').toLowerCase();
  }

  private getResolvedStatus(): ApplicationStatusDefinition {
    return getApplicationStatusDefinition(this.application?.approval_status);
  }

  getApplicantFullName(): string {
    const fullName =
      `${this.application?.first_name ?? ''} ${this.application?.last_name ?? ''}`.trim();
    return fullName || 'Applicant';
  }

  getApplicantPhotoUrl(): string {
    return (
      this.application?.passport_photo?.file_url ??
      'assets/dashboard/profile.jpeg'
    );
  }

  isShortlistedForExam(): boolean {
    return this.getResolvedStatus().key === 'shortlisted';
  }

  isComplianceStatus(): boolean {
    return this.getResolvedStatus().key === 'compliance_required';
  }

  isComplianceIssued(): boolean {
    const status = this.getNormalizedApprovalStatus();
    return (
      status === 'issued compliance directive' ||
      (this.isComplianceStatus() &&
        (this.application?.compliance_directive ?? '').trim().length > 0)
    );
  }

  isComplianceRequired(): boolean {
    return this.getResolvedStatus().key === 'compliance_required';
  }

  isComplianceBaseState(): boolean {
    return this.isComplianceRequired() || this.isComplianceIssued();
  }

  isRejected(): boolean {
    const statusKey = this.getResolvedStatus().key;
    return statusKey === 'rejected' || statusKey === 'auto_rejected';
  }

  getDisplayStatus(): string {
    return this.getResolvedStatus().label;
  }

  getDisplayStatusDescription(): string {
    return this.getResolvedStatus().description;
  }

  getHeroStatusClass(): string {
    const statusKey = this.getResolvedStatus().key;
    if (statusKey === 'admitted') {
      return 'hero-status-admitted';
    }
    if (statusKey === 'approved') {
      return 'hero-status-approved';
    }
    if (statusKey === 'shortlisted') {
      return 'hero-status-shortlisted';
    }
    if (statusKey === 'compliance_required') {
      return 'hero-status-directive';
    }
    if (statusKey === 'resubmitted') {
      return 'hero-status-resubmitted';
    }
    if (statusKey === 'rejected' || statusKey === 'auto_rejected') {
      return 'hero-status-rejected';
    }
    return 'hero-status-pending';
  }

  getStatusClassName(): string {
    const statusKey = this.getResolvedStatus().key;
    if (statusKey === 'admitted') {
      return 'status-admitted';
    }
    if (statusKey === 'approved') {
      return 'status-approved';
    }
    if (this.isComplianceBaseState()) {
      return 'status-compliance';
    }
    if (this.isShortlistedForExam()) {
      return 'status-shortlisted';
    }
    if (this.isRejected()) {
      return 'status-rejected';
    }
    return 'status-default';
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../widgets/sidebar/sidebar.component';
import { TopbarComponent } from '../../../widgets/topbar/topbar.component';
import { WidgetService } from '../../../services/widget.service';
import { sidebarStateDTO } from '../../../model/page.dto';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ApplicationService,
  ComplianceDirectivePayload,
  RejectApplicantPayload,
} from '../../../services/application.service';
import {
  AcademicHistory,
  Application,
  ApplicationListResponse,
  Certificate,
} from '../../../model/dashboard/applicant';
import { TabViewModule } from 'primeng/tabview';
import {
  ReusableTableColumn,
  ReusableTableComponent,
} from '../../../widgets/reusable-table/reusable-table.component';
import { Observable } from 'rxjs';
import { ActionNoteModalComponent } from '../../../widgets/action-note-modal/action-note-modal.component';
import { ButtonComponent } from '../../../widgets/button/button.component';

@Component({
  selector: 'app-applicantdetail',
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    RouterModule,
    TabViewModule,
    ReusableTableComponent,
    ActionNoteModalComponent,
    ButtonComponent,
  ],
  templateUrl: './applicantdetail.component.html',
  styleUrl: './applicantdetail.component.scss',
})
export class ApplicantdetailComponent implements OnInit {
  private readonly rejectAction = 'reject';
  private readonly complianceAction = 'compliance';
  sidebarVisible = false;
  _widgetService = inject(WidgetService);
  _applicationservice = inject(ApplicationService);
  application: Application = {} as Application;
  route = inject(ActivatedRoute);

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
  academicHistoryRows: Record<string, unknown>[] = [];
  documentRows: Record<string, unknown>[] = [];

  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });

    this.app_no = this.route.snapshot.paramMap.get('appno');
  }
  ngOnInit(): void {
    this.app_no = this.app_no!.replaceAll('_', '/');

    this._applicationservice
      .getapplication(this.app_no!)
      .subscribe((data: ApplicationListResponse) => {
        if (data.data.length > 0) {
          this.application = data.data[0];
          this.buildDetailRows();
        }
      });
  }

  getAcademicHistory(name: string): AcademicHistory | undefined {
    if (name == 'primary') {
      return this.application.academic_history.filter(
        (f) => f.certificate_type == 'Primary School Leaving Certificate',
      )[0];
    } else if (name == 'secondary') {
      return this.application.academic_history.filter(
        (f) => f.certificate_type == 'SSSCE',
      )[0];
    } else {
      return undefined;
    }
  }
  getAttemptCount(): number {
    return this.application.academic_history.filter(
      (f) => f.certificate_type == 'SSSCE',
    ).length;
  }

  getSubjects(): string {
    const subjects = this.application.o_level_result![0].subjects;
    const subjectFormats: Record<string, string> = {
      english: 'English Language',
      math: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
    };

    return subjects
      .map((item) => {
        const formattedSubject =
          subjectFormats[item.subject.toLowerCase()] ||
          item.subject.charAt(0).toUpperCase() + item.subject.slice(1);
        return `${formattedSubject} - ${item.grade.toUpperCase()}`;
      })
      .join(', ');
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

  getfileName(
    fileobj:
      | Certificate
      | {
          file_url: string;
          file_name: string;
          file_size: number;
          file_type: string;
        }
      | null
      | undefined,
  ): string {
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
    const file = row['file'] as
      | Certificate
      | {
          file_url: string;
          file_name: string;
          file_size: number;
          file_type: string;
        }
      | undefined;
    return file ?? null;
  }

  issueComplianceDirective() {
    if (
      !this.application?.id ||
      this.isIssuingCompliance ||
      this.isComplianceIssued()
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
        this.application.approval_status = 'Shortlisted';
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
      window.alert('Applicant ID not found for this action.');
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
          this.application.approval_status = 'Compliance';
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
        this.application.approval_status = 'Rejected';
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
        window.alert(successMessage);
      },
      error: (err) => {
        const message =
          err?.error?.message || err?.error?.detail || 'Action failed.';
        window.alert(message);
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
    const examinationYear = hasOLevelResults ? this.getYear() : null;

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
        value: this.application.residential_address?.address,
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

    this.academicHistoryRows = [
      { label: 'Primary School', value: primaryHistory?.institution },
      {
        label: 'Duration',
        value: `${primaryHistory?.from_date ?? '-----'} to ${primaryHistory?.to_date ?? '-----'}`,
      },
      { label: 'Secondary School', value: secondaryHistory?.institution },
      {
        label: 'Duration',
        value: `${secondaryHistory?.from_date ?? '-----'} to ${secondaryHistory?.to_date ?? '-----'}`,
      },
      {
        label: 'Qualification',
        value: secondaryHistory?.certificate_type ?? '-----',
      },
      { label: 'Number of Attempts', value: this.getAttemptCount() },
      {
        label: 'Examination Name',
        value: hasOLevelResults ? this.getExamName() : '-----',
      },
      {
        label: 'Examination Year',
        value: examinationYear ?? '-----',
      },
      {
        label: 'Grades',
        value: hasOLevelResults ? this.getSubjects() : '-----',
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

  isShortlistedForExam(): boolean {
    return this.getNormalizedApprovalStatus().includes('shortlist');
  }

  isComplianceStatus(): boolean {
    return this.getNormalizedApprovalStatus().includes('compliance');
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
    const status = this.getNormalizedApprovalStatus();
    return status === 'complaince required' || status === 'compliance required';
  }

  isComplianceBaseState(): boolean {
    return this.isComplianceRequired() || this.isComplianceIssued();
  }

  isRejected(): boolean {
    return this.getNormalizedApprovalStatus().includes('reject');
  }

  getDisplayStatus(): string {
    if (this.isComplianceRequired()) {
      return 'Compliance required';
    }
    if (this.isComplianceIssued()) {
      return 'Issued compliance directive';
    }
    if (this.isShortlistedForExam()) {
      return 'Shortlisted for Exam';
    }
    return this.application.approval_status ?? 'Pending';
  }

  getStatusClassName(): string {
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

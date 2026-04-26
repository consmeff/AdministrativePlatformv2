import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { forkJoin, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { AdminDashboardMetrics } from '../../model/dashboard/admin-dashboard.dto';
import { Application } from '../../model/dashboard/applicant';
import { role } from '../../model/page.dto';
import {
  ApplicationService,
  ComplianceDirectivePayload,
} from '../../services/application.service';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import {
  ActionModalPayload,
  ActionNoteModalComponent,
} from '../../widgets/action-note-modal/action-note-modal.component';
import { DoughnutComponent } from '../../widgets/doughnut/doughnut.component';
import { MetricCardComponent } from '../../widgets/metric-card/metric-card.component';
import {
  StatusIndicatorComponent,
  StatusTone,
} from '../../widgets/status-indicator/status-indicator.component';
import { TableRowActionsComponent } from '../../widgets/table-row-actions/table-row-actions.component';

interface DashboardRow {
  id: number;
  application_no: string;
  full_name: string;
  submission_date: string;
  programme: string;
  status_text: string;
  status_tone: StatusTone;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    DoughnutComponent,
    SelectModule,
    FormsModule,
    TableModule,
    ActionNoteModalComponent,
    MetricCardComponent,
    StatusIndicatorComponent,
    TableRowActionsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly subscriptions = new Subscription();
  private readonly applicationService = inject(ApplicationService);
  private readonly router = inject(Router);
  private readonly dashInfoService = inject(DashboardinformationService);
  private readonly busyService = inject(BusyIndicatorService);

  _dash: DashboardInfo = {} as DashboardInfo;
  staffs: role[] = [];
  selectedstaff = 1;

  tableColumns = [
    'Application Number',
    'Candidate',
    'Submission Date',
    'Pref. Programme',
    'Status',
    'Actions',
  ];

  applicationList: Application[] = [];
  recentRows: DashboardRow[] = [];

  metrics: AdminDashboardMetrics = {
    total_applicants: 0,
    top_5_courses: [],
    approval_status_breakdown: {
      total_pending: 0,
      total_rejected: 0,
      total_shortlisted: 0,
      total_approved: 0,
      total_confirmed: 0,
      total_compliance_required: 0,
    },
    payment_status_counts: [],
  };
  paymentCounts: Record<string, number> = { initiated: 0 };
  chartData: {
    pending: number;
    shortlisted: number;
    compliance: number;
    rejected: number;
  } = {
    pending: 0,
    shortlisted: 0,
    compliance: 0,
    rejected: 0,
  };

  isReasonModalVisible = false;
  isReasonActionLoading = false;
  reasonModalTitle = 'Issue Compliance Directive';
  reasonModalPrompt = '';
  reasonModalConfirmLabel = 'Issue Directive';
  reasonModalInitialNote = '';
  pendingDirectiveApplicantId: number | null = null;
  directiveDocumentOptions = [
    'Certificate of Birth',
    "O'Level Result",
    'Passport Photograph',
    'UTME Result',
  ];
  directiveReasons = [
    'Blurry Document',
    'Wrong File Uploaded',
    'Name Mismatch with Application',
    'Others (specify below)',
  ];
  directiveSelectedReason = '';
  directiveSelectedDocuments: string[] = [];

  constructor() {
    this.dashInfoService.dashInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this._dash = val));
  }

  ngOnInit(): void {
    this.busyService.show();
    this.loadDashboardData();
    this.staffs = [
      { name: 'Acad. Officer', code: 1 },
      { name: 'Admin', code: 2 },
    ];
  }

  private updateMetricsViewModel(): void {
    this.paymentCounts = this.metrics.payment_status_counts.reduce<
      Record<string, number>
    >(
      (acc, curr) => {
        acc[curr.payment_status.toLowerCase()] = curr.count;
        return acc;
      },
      { initiated: 0 },
    );
    this.chartData = {
      pending: this.metrics.approval_status_breakdown.total_pending,
      shortlisted: this.metrics.approval_status_breakdown.total_shortlisted,
      compliance:
        this.metrics.approval_status_breakdown.total_compliance_required,
      rejected: this.metrics.approval_status_breakdown.total_rejected,
    };
  }

  private populateSummary() {
    this.recentRows = this.applicationList.slice(0, 5).map((item) => {
      const status = this.resolveStatus(item.approval_status);
      return {
        id: item.id,
        application_no: item.application_no,
        full_name: `${item.first_name} ${item.last_name}`.trim(),
        submission_date: this.formatDate(item.created_at),
        programme: item.program?.name ?? 'N/A',
        status_text: status.text,
        status_tone: status.tone,
      };
    });
  }

  private resolveStatus(status: string): { text: string; tone: StatusTone } {
    const value = (status ?? '').toLowerCase();
    if (value.includes('resubmit')) {
      return { text: 'Resubmitted', tone: 'resubmitted' };
    }
    if (value.includes('shortlist')) {
      return { text: 'Shortlisted', tone: 'shortlisted' };
    }
    if (value.includes('compliance') || value.includes('directive')) {
      return { text: 'Directive Issued', tone: 'directive' };
    }
    if (value.includes('reject')) {
      return { text: 'Rejected', tone: 'rejected' };
    }
    return { text: 'Pending Review', tone: 'pending' };
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

  viewProfile(row: DashboardRow) {
    this.router.navigateByUrl(
      `/pages/applicants/applicantdetail/${row.application_no.replaceAll('/', '_')}`,
    );
  }

  shortlistSingle(row: DashboardRow) {
    this.performApplicantAction(
      this.applicationService.shortlistApplicants({ applicant_ids: [row.id] }),
      'Candidate shortlisted successfully.',
    );
  }

  openComplianceForSingle(row: DashboardRow) {
    this.pendingDirectiveApplicantId = row.id;
    this.reasonModalPrompt = `Issue compliance directive to ${row.full_name}?`;
    this.reasonModalInitialNote = '';
    this.directiveSelectedReason = '';
    this.directiveSelectedDocuments = [];
    this.isReasonModalVisible = true;
  }

  closeReasonModal() {
    this.isReasonModalVisible = false;
    this.pendingDirectiveApplicantId = null;
    this.reasonModalInitialNote = '';
  }

  submitReasonModalPayload(payload: ActionModalPayload) {
    if (!this.pendingDirectiveApplicantId) {
      window.alert('Applicant ID not found for this action.');
      return;
    }

    this.isReasonActionLoading = true;
    const requestPayload: ComplianceDirectivePayload = {
      applicant_ids: [this.pendingDirectiveApplicantId],
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
    request: Observable<unknown>,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    this.busyService.show();
    request.subscribe({
      next: () => {
        onSuccess?.();
        window.alert(successMessage);
        this.loadDashboardData();
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

  private loadDashboardData() {
    this.subscriptions.add(
      forkJoin({
        recentApplications: this.applicationService.getapplications(
          undefined,
          5,
        ),
        metrics: this.applicationService.getAdminDashboardMetrics(),
      }).subscribe({
        next: ({ recentApplications, metrics }) => {
          this.applicationList = recentApplications.data;
          this.populateSummary();

          if (this.applicationList.length > 0) {
            this._dash.academicsession = this.applicationList[0].session.name;
            this.dashInfoService.setdashInfo(this._dash);
          }

          this.metrics = metrics;
          this.updateMetricsViewModel();
        },
        error: () => {
          this.busyService.hide();
        },
        complete: () => {
          this.busyService.hide();
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}

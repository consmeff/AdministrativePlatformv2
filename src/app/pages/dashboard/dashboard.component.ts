import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { forkJoin, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { AdminDashboardMetrics } from '../../model/dashboard/admin-dashboard.dto';
import { Application } from '../../model/dashboard/applicant';
import {
  ApplicationService,
  ComplianceDirectivePayload,
} from '../../services/application.service';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { NotificationService } from '../../services/notification.service';
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
import { ApplicantdetailComponent } from '../applicants/applicantdetail/applicantdetail.component';

interface DashboardRow {
  id: number;
  application_no: string;
  applicant: string;
  jamb_score: number;
  o_level: string;
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
    DrawerModule,
    DoughnutComponent,
    TableModule,
    ActionNoteModalComponent,
    MetricCardComponent,
    StatusIndicatorComponent,
    TableRowActionsComponent,
    ApplicantdetailComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly subscriptions = new Subscription();
  private readonly applicationService = inject(ApplicationService);
  private readonly dashInfoService = inject(DashboardinformationService);
  private readonly busyService = inject(BusyIndicatorService);
  private readonly notification = inject(NotificationService);

  _dash: DashboardInfo = {} as DashboardInfo;

  tableColumns = [
    'Applicant',
    'JAMB',
    'O Level',
    'Submission Date',
    'Programme',
    'Status',
    'Actions',
  ];

  applicationList: Application[] = [];
  recentRows: DashboardRow[] = [];
  selectedRows: DashboardRow[] = [];
  isApplicantDrawerVisible = false;
  activeApplicationNo: string | null = null;

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
  chartData: {
    pending: number;
    shortlisted: number;
    resubmitted: number;
    rejected: number;
  } = {
    pending: 0,
    shortlisted: 0,
    resubmitted: 0,
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
  }

  private updateMetricsViewModel(): void {
    this.chartData = {
      pending: this.metrics.approval_status_breakdown.total_pending,
      shortlisted: this.metrics.approval_status_breakdown.total_shortlisted,
      resubmitted:
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
        applicant: `${item.first_name} ${item.last_name}`.trim(),
        jamb_score: item.utme_score ?? item.utme_result?.score ?? 0,
        o_level: `${item.o_level_point ?? item.o_level_result?.[0]?.subjects?.length ?? 0}`,
        submission_date: this.formatDate(
          item.updated_at ?? item.created_at ?? '',
        ),
        programme:
          typeof item.department === 'string'
            ? item.department
            : (item.department?.name ?? item.program?.name ?? 'N/A'),
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
    this.activeApplicationNo = row.application_no;
    this.isApplicantDrawerVisible = true;
  }

  closeApplicantDrawer(): void {
    this.isApplicantDrawerVisible = false;
    this.activeApplicationNo = null;
  }

  shortlistSingle(row: DashboardRow) {
    this.performApplicantAction(
      this.applicationService.shortlistApplicants({ applicant_ids: [row.id] }),
      'Candidate shortlisted successfully.',
    );
  }

  openComplianceForSingle(row: DashboardRow) {
    this.pendingDirectiveApplicantId = row.id;
    this.reasonModalPrompt = `Issue compliance directive to ${row.applicant}?`;
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
      this.notification.error('Applicant ID not found for this action.');
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
        this.notification.success(successMessage);
        this.loadDashboardData();
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
          this.selectedRows = this.selectedRows.filter((selected) =>
            this.recentRows.some((row) => row.id === selected.id),
          );

          if (this.applicationList.length > 0) {
            this._dash.academicsession =
              this.applicationList[0].session?.name ??
              this._dash.academicsession;
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

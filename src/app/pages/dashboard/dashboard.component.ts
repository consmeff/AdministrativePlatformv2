import {
  Component,
  HostListener,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { role } from '../../model/page.dto';
import { DoughnutComponent } from '../../widgets/doughnut/doughnut.component';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import {
  Application,
  ApplicationSummary,
} from '../../model/dashboard/applicant';
import { Column } from '../../model/page.dto';
import {
  ApplicationService,
  ComplianceDirectivePayload,
  RejectApplicantPayload,
} from '../../services/application.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { Router, RouterModule } from '@angular/router';
import { AdminDashboardMetrics } from '../../model/dashboard/admin-dashboard.dto';
import { ActionNoteModalComponent } from '../../widgets/action-note-modal/action-note-modal.component';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly rejectAction = 'reject';
  private readonly complianceAction = 'compliance';
  selectedRowData?: ApplicationSummary;
  showActionMenu = false;
  menuPosition = { x: 0, y: 0 };
  _applicationService = inject(ApplicationService);
  router = inject(Router);
  dashInfoService = inject(DashboardinformationService);
  _dash: DashboardInfo = {} as DashboardInfo;
  staffs: role[] = [];
  selectedstaff = 1;
  application!: Application[];
  subscriptions = new Subscription();
  cols!: Column[];
  applicationList: Application[] = [];
  app_summ: ApplicationSummary[] = [];
  busyService = inject(BusyIndicatorService);
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
  reasonModalTitle = '';
  reasonModalPrompt = '';
  reasonModalConfirmLabel = '';
  reasonModalInitialNote = '';
  pendingReasonAction: 'reject' | 'compliance' | null = null;
  pendingReasonApplicant?: ApplicationSummary;

  constructor() {
    this.dashInfoService.dashInfo$.subscribe((val) => {
      this._dash = val;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      !(event.target as Element).closest('.action-icon') &&
      !(event.target as Element).closest('.action-menu')
    ) {
      this.showActionMenu = false;
    }
  }

  ngOnInit(): void {
    this.busyService.show();
    this.loadDashboardData();

    this.staffs = [
      { name: 'Acad. Officer', code: 1 },
      { name: 'Admin', code: 2 },
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

  populateSummary() {
    this.app_summ = [];
    const batch = this.applicationList.slice(0, 5);
    batch.forEach((v) => {
      const _summ: ApplicationSummary = {
        id: v.id,
        application_no: v.application_no,
        first_name: v.first_name,
        last_name: v.last_name,
        created_at: v.created_at.toString(),
        program: v.program.name,
        approval_status: v.approval_status,
        action: '<i class="bi bi-three-dots"></i>',
      };
      this.app_summ.push(_summ);
    });
  }

  showActionModal(event: MouseEvent, rowData: ApplicationSummary) {
    event.stopPropagation();
    if (
      this.selectedRowData?.application_no === rowData.application_no &&
      this.showActionMenu
    ) {
      this.showActionMenu = false;
      return;
    }

    this.selectedRowData = rowData;
    this.showActionMenu = true;

    this.menuPosition = {
      x: event.clientX - 10,
      y: event.clientY + 10,
    };

    const menuWidth = 250;
    const menuHeight = 200;

    if (this.menuPosition.x + menuWidth > window.innerWidth) {
      this.menuPosition.x = window.innerWidth - menuWidth - 10;
    }

    if (this.menuPosition.y + menuHeight > window.innerHeight) {
      this.menuPosition.y = event.clientY - menuHeight - 10;
    }
  }

  handleAction(action: string, rowData: ApplicationSummary) {
    const applicationNo = rowData.application_no;
    const applicantId = rowData.id;
    this.showActionMenu = false;

    if (!applicantId) {
      window.alert('Applicant ID not found for this action.');
      return;
    }

    switch (action.toLowerCase()) {
      case 'view profile':
        this.router.navigateByUrl(
          `/pages/applicants/applicantdetail/${applicationNo.replaceAll('/', '_')}`,
        );
        break;
      case 'reject candidate': {
        this.openReasonModal(this.rejectAction, rowData);
        break;
      }
      case 'shortlist candidate':
        this.performApplicantAction(
          this._applicationService.shortlistApplicants({
            applicant_ids: [applicantId],
          }),
          'Candidate shortlisted successfully.',
        );
        break;
      case 'issue compliance directive': {
        this.openReasonModal(this.complianceAction, rowData);
        break;
      }
    }
  }

  openReasonModal(
    action: 'reject' | 'compliance',
    rowData: ApplicationSummary,
  ) {
    const fullName = `${rowData.first_name} ${rowData.last_name}`.trim();
    this.pendingReasonAction = action;
    this.pendingReasonApplicant = rowData;
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
    this.reasonModalInitialNote = '';
    this.isReasonModalVisible = true;
  }

  closeReasonModal() {
    this.isReasonModalVisible = false;
    this.pendingReasonAction = null;
    this.pendingReasonApplicant = undefined;
    this.reasonModalInitialNote = '';
  }

  submitReasonModal(note: string) {
    const applicantId = this.pendingReasonApplicant?.id;
    if (!applicantId || !this.pendingReasonAction) {
      window.alert('Applicant ID not found for this action.');
      return;
    }

    this.isReasonActionLoading = true;

    if (this.pendingReasonAction === this.complianceAction) {
      const payload: ComplianceDirectivePayload = {
        applicant_ids: [applicantId],
        extra_note: note,
      };
      this.performApplicantAction(
        this._applicationService.issueComplianceDirective(payload),
        'Compliance directive issued successfully.',
        () => this.closeReasonModal(),
      );
      return;
    }

    const payload: RejectApplicantPayload = {
      applicant_ids: [applicantId],
      extra_note: note,
    };
    this.performApplicantAction(
      this._applicationService.rejectApplicants(payload),
      'Candidate rejected successfully.',
      () => this.closeReasonModal(),
    );
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
        recentApplications: this._applicationService.getapplications(
          undefined,
          5,
        ),
        metrics: this._applicationService.getAdminDashboardMetrics(),
      }).subscribe({
        next: ({ recentApplications, metrics }) => {
          if (recentApplications.data.length > 0) {
            this.applicationList = recentApplications.data;
            this.populateSummary();
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
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}

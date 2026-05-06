import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { NotificationService } from '../../services/notification.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentReceiptModalComponent } from './receipt-modal/payment-receipt-modal.component';
import { MetricCardComponent } from '../../widgets/metric-card/metric-card.component';
import {
  FilterOption,
  PaymentDetailDto,
  PaymentsListItemDto,
  PaymentsListResponseDto,
  PaymentStatus,
  PaymentType,
  TransactionRow,
} from './payment-record.types';

@Component({
  selector: 'app-payment-record',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    PaginatorModule,
    PaymentReceiptModalComponent,
    MetricCardComponent,
  ],
  templateUrl: './payment-record.component.html',
  styleUrl: './payment-record.component.scss',
})
export class PaymentRecordComponent implements OnInit, OnDestroy {
  private readonly paymentService = inject(PaymentService);
  private readonly busyService = inject(BusyIndicatorService);
  private readonly notification = inject(NotificationService);
  private readonly searchChanged = new Subject<string>();
  private readonly subscriptions = new Subscription();
  searchText = '';

  readonly sessionOptions: FilterOption[] = [
    { label: '2025/26', value: '2025-26' },
    { label: '2024/25', value: '2024-25' },
  ];
  selectedSession: FilterOption = this.sessionOptions[0];

  readonly orderingOptions: FilterOption[] = [
    { label: 'Newest First', value: '-created_at' },
    { label: 'Oldest First', value: 'created_at' },
    { label: 'Amount (High to Low)', value: '-amount' },
    { label: 'Amount (Low to High)', value: 'amount' },
  ];
  selectedOrdering: FilterOption = this.orderingOptions[0];

  readonly rows = 10;
  first = 0;
  totalRecords = 0;

  allTransactions: TransactionRow[] = [];
  selectedTransaction: TransactionRow | null = null;

  readonly summaryCards = [
    {
      title: 'Total Revenue',
      value: 'N684.3M',
      subtext: '1054 Transactions',
    },
    {
      title: 'Application Fees',
      value: 'N4.9M',
      subtext: '247 payments',
    },
    {
      title: 'Acceptance Fees',
      value: 'N2.7M',
      subtext: '90 payments',
    },
    {
      title: 'School Fees',
      value: 'N535.4M',
      subtext: '893 students',
    },
    {
      title: 'Other Fees',
      value: 'N10.3M',
      subtext: '893 students',
    },
  ];

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchChanged
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          switchMap(() => this.fetchPayments()),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.fetchPayments().subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSearchChange(text: string): void {
    this.searchText = text;
    this.first = 0;
    this.searchChanged.next(text.trim());
  }

  onOrderingChange(): void {
    this.first = 0;
    this.subscriptions.add(this.fetchPayments().subscribe());
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.subscriptions.add(this.fetchPayments().subscribe());
  }

  get pagedTransactions(): TransactionRow[] {
    return this.allTransactions;
  }

  openTransactionDetails(transaction: TransactionRow): void {
    this.busyService.show();
    this.subscriptions.add(
      this.paymentService.getPaymentByRefId(transaction.referenceNo).subscribe({
        next: (detail) => {
          this.selectedTransaction = this.mapPaymentDetail(detail, transaction);
        },
        error: () => {
          this.notification.error('Unable to load payment details.');
        },
        complete: () => {
          this.busyService.hide();
        },
      }),
    );
  }

  closeTransactionDetails(): void {
    this.selectedTransaction = null;
  }

  downloadReceipt(transaction: TransactionRow): void {
    this.notification.warn(
      `Download receipt is not yet wired for ${transaction.referenceNo}.`,
    );
  }

  getStatusClass(status: PaymentStatus): string {
    return `status-${status}`;
  }

  getStatusLabel(status: PaymentStatus): string {
    if (status === 'successful') {
      return 'Successful';
    }
    if (status === 'failed') {
      return 'Failed';
    }
    return 'Pending';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private fetchPayments() {
    const page = Math.floor(this.first / this.rows) + 1;
    this.busyService.show();
    return this.paymentService
      .getPayments({
        page,
        search: this.searchText.trim() || undefined,
        // ordering: this.selectedOrdering.value || undefined,
      })
      .pipe(
        tap((response: PaymentsListResponseDto) => {
          this.totalRecords = Number(response.count ?? 0);
          this.allTransactions = (response.results ?? []).map((item, index) =>
            this.mapPaymentListItem(item, index),
          );
        }),
        catchError(() => {
          // this.notification.error('Unable to load payment records.');
          this.allTransactions = [];
          this.totalRecords = 0;
          return of(null);
        }),
        finalize(() => this.busyService.hide()),
      );
  }

  private mapPaymentListItem(
    item: PaymentsListItemDto,
    index: number,
  ): TransactionRow {
    const date = this.parseDate(item.created_at);
    return {
      id: `${index + 1}`,
      dateText: this.formatDate(date),
      timeText: this.formatTime(date),
      fullName: item.applicant_name ?? 'N/A',
      applicationNo: item.applicant_no ?? 'N/A',
      paymentTypeLabel: item.payment_type ?? 'N/A',
      referenceNo: item.ref_id ?? 'N/A',
      summary: item.summary,
      programme: item.programme ?? 'N/A',
      amount: this.toNumber(item.amount),
      amountPaid: this.toNumber(item.amount_paid),
      status: this.normalizeStatus(item.status),
      paymentDateTime: `${this.formatDate(date)}, ${this.formatTime(date)}`,
      createdAt: item.created_at,
      payerLevel: 'N/A',
      email: 'N/A',
      phoneNumber: 'N/A',
      dateGroup: this.toDateGroup(date),
      paymentType: this.normalizePaymentType(item.payment_type),
    };
  }

  private mapPaymentDetail(
    detail: PaymentDetailDto,
    base: TransactionRow,
  ): TransactionRow {
    const date = this.parseDate(detail.created_at);
    return {
      ...base,
      paymentTypeLabel: detail.payment_type ?? base.paymentTypeLabel,
      amount: this.toNumber(detail.amount),
      amountPaid: this.toNumber(detail.amount_paid),
      status: this.normalizeStatus(detail.status),
      summary: detail.summary ?? base.summary,
      dateText: this.formatDate(date),
      timeText: this.formatTime(date),
      paymentDateTime: `${this.formatDate(date)}, ${this.formatTime(date)}`,
      createdAt: detail.created_at,
      applicationNo: detail.applicant_no ?? base.applicationNo,
      fullName: detail.applicant_name ?? base.fullName,
      programme: detail.programme ?? base.programme,
      email: detail.email ?? base.email,
      phoneNumber: detail.phone_number ?? base.phoneNumber,
      payerLevel: detail.level_of_study ?? base.payerLevel,
      paymentType: this.normalizePaymentType(detail.payment_type),
    };
  }

  private normalizeStatus(status: string): PaymentStatus {
    const value = (status ?? '').trim().toLowerCase();
    if (value.includes('success')) {
      return 'successful';
    }
    if (value.includes('fail')) {
      return 'failed';
    }
    return 'pending';
  }

  private normalizePaymentType(value: string): PaymentType {
    return (value ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  }

  private toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private parseDate(value: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }
    return parsed;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  private toDateGroup(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { NotificationService } from '../../services/notification.service';
import { PaymentReceiptModalComponent } from './receipt-modal/payment-receipt-modal.component';
import {
  FilterOption,
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
  ],
  templateUrl: './payment-record.component.html',
  styleUrl: './payment-record.component.scss',
})
export class PaymentRecordComponent implements OnInit {
  private readonly notification = inject(NotificationService);
  searchText = '';

  readonly sessionOptions: FilterOption[] = [
    { label: '2025/26', value: '2025-26' },
    { label: '2024/25', value: '2024-25' },
  ];
  selectedSession: FilterOption = this.sessionOptions[0];

  readonly paymentTypeOptions: FilterOption[] = [
    { label: 'All Payment Type', value: 'all' },
    { label: 'Application Fees', value: 'application-fee' },
    { label: 'Acceptance Fees', value: 'acceptance-fee' },
    { label: 'School Fees', value: 'school-fees' },
    { label: 'Other Fees', value: 'other' },
  ];
  selectedPaymentType: FilterOption = this.paymentTypeOptions[0];

  readonly statusOptions: FilterOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Successful', value: 'successful' },
    { label: 'Failed', value: 'failed' },
    { label: 'Pending', value: 'pending' },
  ];
  selectedStatus: FilterOption = this.statusOptions[0];

  readonly programmeOptions: FilterOption[] = [
    { label: 'All Programmes', value: 'all' },
    { label: 'Nursing', value: 'Nursing' },
    { label: 'Public Health', value: 'Public Health' },
    { label: 'Midwifery', value: 'Midwifery' },
    { label: 'Pharmacy', value: 'Pharmacy' },
  ];
  selectedProgramme: FilterOption = this.programmeOptions[0];

  readonly dateOptions: FilterOption[] = [
    { label: 'All Date', value: 'all' },
    { label: '24 Jan 2026', value: '2026-01-24' },
    { label: '23 Jan 2026', value: '2026-01-23' },
    { label: '22 Jan 2026', value: '2026-01-22' },
  ];
  selectedDate: FilterOption = this.dateOptions[0];

  readonly rows = 10;
  first = 0;

  allTransactions: TransactionRow[] = [];
  filteredTransactions: TransactionRow[] = [];
  selectedTransaction: TransactionRow | null = null;

  readonly summaryCards = [
    { title: 'Application Fees', amountText: 'N4.9M', subText: '247 payments' },
    { title: 'Acceptance Fees', amountText: 'N2.7M', subText: '90 payments' },
    { title: 'School Fees', amountText: 'N535.4M', subText: '893 students' },
    { title: 'Other Fees', amountText: 'N10.3M', subText: '893 students' },
  ];

  ngOnInit(): void {
    this.allTransactions = this.buildMockTransactions();
    this.applyFilters();
  }

  onSearchChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onPaymentTypeChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onProgrammeChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onDateChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
  }

  get pagedTransactions(): TransactionRow[] {
    return this.filteredTransactions.slice(this.first, this.first + this.rows);
  }

  openTransactionDetails(transaction: TransactionRow): void {
    this.selectedTransaction = transaction;
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

  private applyFilters(): void {
    const keyword = this.searchText.trim().toLowerCase();

    this.filteredTransactions = this.allTransactions.filter((row) => {
      if (
        this.selectedStatus.value !== 'all' &&
        row.status !== this.selectedStatus.value
      ) {
        return false;
      }

      if (
        this.selectedPaymentType.value !== 'all' &&
        row.paymentType !== this.selectedPaymentType.value
      ) {
        return false;
      }

      if (
        this.selectedProgramme.value !== 'all' &&
        row.programme !== this.selectedProgramme.value
      ) {
        return false;
      }

      if (
        this.selectedDate.value !== 'all' &&
        row.dateGroup !== this.selectedDate.value
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        row.fullName.toLowerCase().includes(keyword) ||
        row.referenceNo.toLowerCase().includes(keyword) ||
        row.applicationNo.toLowerCase().includes(keyword)
      );
    });
  }

  private buildMockTransactions(): TransactionRow[] {
    const names = [
      'Gbadegesin Ishola Dada',
      'Adebayo Tunde',
      'Okafor Chika',
      'Usman Aisha',
      'Yakub Ajibade',
      'Omotosho Bisi',
    ];
    const programmes = ['Nursing', 'Public Health', 'Midwifery', 'Pharmacy'];
    const levels = ['OND 1', 'OND 2', 'HND 1', 'HND 2'];
    const dates = [
      { text: '24 Jan 2026', key: '2026-01-24' },
      { text: '23 Jan 2026', key: '2026-01-23' },
      { text: '22 Jan 2026', key: '2026-01-22' },
    ];
    const paymentTypes: {
      type: PaymentType;
      label: string;
      installment?: string;
      amount: number;
    }[] = [
      {
        type: 'acceptance-fee',
        label: 'Admission Acceptance',
        amount: 10000,
      },
      {
        type: 'school-fees',
        label: 'School Fees',
        installment: '1st Installment',
        amount: 100000,
      },
      {
        type: 'application-fee',
        label: 'Application Fees',
        amount: 5000,
      },
      {
        type: 'other',
        label: 'Other Fees',
        amount: 15000,
      },
    ];

    return Array.from({ length: 40 }).map((_, index) => {
      const name = names[index % names.length];
      const programme = programmes[index % programmes.length];
      const level = levels[index % levels.length];
      const dateInfo = dates[index % dates.length];
      const paymentTypeInfo = paymentTypes[index % paymentTypes.length];
      const statusSeed = index % 8;
      const status: PaymentStatus =
        statusSeed === 0
          ? 'failed'
          : statusSeed === 1
            ? 'pending'
            : 'successful';

      return {
        id: String(index + 1),
        dateText: dateInfo.text,
        timeText: `${(index % 12) + 1}:58 ${index % 2 === 0 ? 'AM' : 'PM'}`,
        fullName: name,
        applicationNo: `CONSMMEFS/ENT-2025/${String(index + 6).padStart(3, '0')}`,
        paymentTypeLabel: paymentTypeInfo.label,
        installmentLabel: paymentTypeInfo.installment,
        referenceNo: `REF-9FL${String(300 + index).padStart(3, '0')}LYXX`,
        programme,
        amount: paymentTypeInfo.amount,
        status,
        paymentDateTime: `${dateInfo.text}, ${(index % 12) + 1}:58 ${index % 2 === 0 ? 'AM' : 'PM'}`,
        payerLevel: level,
        email: `${name.split(' ')[0].toLowerCase()}@gmail.com`,
        phoneNumber: `0802${String(773600 + index).padStart(6, '0')}`,
        dateGroup: dateInfo.key,
        paymentType: paymentTypeInfo.type,
      };
    });
  }
}

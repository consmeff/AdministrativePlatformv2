import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TransactionRow } from '../payment-record.types';

@Component({
  selector: 'app-payment-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-receipt-modal.component.html',
  styleUrl: './payment-receipt-modal.component.scss',
})
export class PaymentReceiptModalComponent {
  @Input({ required: true }) transaction!: TransactionRow;
  @Output() closed = new EventEmitter<void>();
  @Output() download = new EventEmitter<TransactionRow>();

  onClose(): void {
    this.closed.emit();
  }

  onDownload(): void {
    this.download.emit(this.transaction);
  }

  getStatusClass(status: TransactionRow['status']): string {
    return `status-${status}`;
  }

  getStatusLabel(status: TransactionRow['status']): string {
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
}

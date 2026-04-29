export type PaymentStatus = 'successful' | 'failed' | 'pending';

export type PaymentType =
  | 'application-fee'
  | 'acceptance-fee'
  | 'school-fees'
  | 'other';

export interface FilterOption {
  label: string;
  value: string;
}

export interface TransactionRow {
  id: string;
  dateText: string;
  timeText: string;
  fullName: string;
  applicationNo: string;
  paymentTypeLabel: string;
  installmentLabel?: string;
  referenceNo: string;
  programme: string;
  amount: number;
  status: PaymentStatus;
  paymentDateTime: string;
  payerLevel: string;
  email: string;
  phoneNumber: string;
  dateGroup: string;
  paymentType: PaymentType;
}

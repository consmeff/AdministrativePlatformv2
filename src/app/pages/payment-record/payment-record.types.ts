export type PaymentStatus = 'successful' | 'failed' | 'pending';

export type PaymentType = string;

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
  summary?: string;
  programme: string;
  amount: number;
  amountPaid?: number;
  status: PaymentStatus;
  paymentDateTime: string;
  createdAt?: string;
  payerLevel: string;
  email: string;
  phoneNumber: string;
  dateGroup: string;
  paymentType: PaymentType;
}

export interface PaymentsListItemDto {
  ref_id: string;
  payment_type: string;
  amount: number | string;
  amount_paid: number | string;
  status: string;
  summary: string;
  created_at: string;
  applicant_no: string;
  applicant_name: string;
  programme: string;
}

export interface PaymentsListResponseDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentsListItemDto[];
}

export interface PaymentDetailDto {
  ref_id: string;
  payment_type: string;
  amount: number | string;
  amount_paid: number | string;
  status: string;
  summary: string;
  created_at: string;
  applicant_no: string;
  applicant_name: string;
  programme: string;
  email: string;
  phone_number: string;
  level_of_study: string;
}

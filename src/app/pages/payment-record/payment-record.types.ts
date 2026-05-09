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
  amount_paid: number | string | null;
  status: string;
  summary: string;
  created_at: string;
  applicant_no: string | null;
  applicant_name: string | null;
  programme?: string | null;
}

export interface PaymentsListResponseDto {
  page_size: number;
  current_page: number;
  last_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  data: PaymentsListItemDto[];
}

export interface PaymentDetailDto {
  ref_id: string;
  payment_type: string;
  amount: number | string | null;
  amount_paid: number | string | null;
  status: string;
  summary: string;
  created_at: string;
  applicant_no?: string | null;
  applicant_name?: string | null;
  programme?: string | null;
  email?: string | null;
  phone_number?: string | null;
  level_of_study?: string | null;
}

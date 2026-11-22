/**
 * Wire shapes for the Board/Provost portals.
 *
 * PROPOSED CONTRACTS — the backend does not serve these yet. They follow the
 * conventions of the existing APIs (snake_case, the same pagination envelope
 * as /api/v1/payments/payments, money as number-or-string).
 */

export interface PaginatedResponseDto<T> {
  page_size: number;
  current_page: number;
  last_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  data: T[];
}

/* ---------- Students ---------- */

/** GET /api/v1/students/summary */
export interface StudentSummaryDto {
  total_students: number;
  by_programme?: { programme: string; count: number }[];
}

export type SchoolFeeStatus = 'Paid' | 'Part Paid' | 'Unpaid';

/** GET /api/v1/students → each item of `data`. Fees are for the current session. */
/** The API may send a related record ({ id, name }) where a plain label is expected. */
export interface NamedRef {
  id?: number | string;
  name?: string | null;
  title?: string | null;
  code?: string | null;
}

export type LabelOrRef = string | number | NamedRef | null | undefined;

export interface StudentDto {
  id: number;
  matric_no: string | null;
  full_name: string;
  email: string | null;
  department: LabelOrRef;
  programme: LabelOrRef;
  level: LabelOrRef;
  session: string | null;
  school_fee_total: number | string;
  school_fee_paid: number | string;
  school_fee_balance: number | string;
  school_fee_status: SchoolFeeStatus;
  last_payment_date: string | null;
}

export interface StudentListQuery {
  page?: number;
  search?: string;
  department?: string;
  level?: string;
  school_fee_status?: SchoolFeeStatus;
}

/* ---------- Expenses ---------- */

export interface ExpenseDto {
  id: number;
  title: string;
  category: string;
  amount: number | string;
  /** YYYY-MM-DD — the day the money was spent, not when it was recorded. */
  expense_date: string;
  description: string | null;
  recorded_by: string | null;
  created_at: string;
}

/** GET /api/v1/finance/expenses/summary */
export interface ExpenseSummaryDto {
  total_expenses: number | string;
  total_count: number;
  this_month_total: number | string;
}

export interface ExpenseListQuery {
  page?: number;
  search?: string;
  category?: string;
  ordering?: string;
}

/** POST /api/v1/finance/expenses */
export interface CreateExpensePayload {
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description?: string;
}

/* ---------- Staff ---------- */

export interface StaffDto {
  id: number;
  staff_id: string | null;
  first_name: string;
  last_name: string;
  other_names: string | null;
  email: string;
  phone_number: string | null;
  staff_type: string;
  is_active: boolean;
  date_joined: string | null;
}

export interface StaffListQuery {
  page?: number;
  search?: string;
  staff_type?: string;
  is_active?: boolean;
}

/** POST /api/v1/staffs and PATCH /api/v1/staffs/:id */
export interface StaffPayload {
  first_name: string;
  last_name: string;
  other_names?: string;
  email: string;
  phone_number?: string;
  staff_type: string;
}

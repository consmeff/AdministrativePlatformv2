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

/** Seen so far: 'Paid' and 'Unpaid'. The part-paid wording is not confirmed. */
export type SchoolFeeStatus = 'Paid' | 'Part Paid' | 'Unpaid';

/** A related record as the students API nests it. */
export interface NamedRef {
  id: number;
  name: string;
  code?: string | null;
}

export interface StudentSchoolFeeDto {
  fee_id: number;
  amount: number | string;
  amount_paid: number | string;
  balance: number | string;
  status: string;
  is_paid: boolean;
}

/** GET /api/v1/students → each item of `data`. */
export interface StudentDto {
  id: number;
  matriculation_number: string | null;
  first_name: string;
  last_name: string;
  other_names: string | null;
  email: string | null;
  phone_number: string | null;
  alt_phone_number?: string | null;
  /** A JSON string: {"file_url", "file_name", "file_size", "file_type"}. */
  passport_photo?: string | null;
  level: NamedRef | null;
  semester: NamedRef | null;
  session: NamedRef | string | null;
  department: NamedRef | null;
  program: NamedRef | null;
  school_fee: StudentSchoolFeeDto | null;
  created_at?: string;
  updated_at?: string;
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

export const EXPENSE_CATEGORIES = [
  'Salaries',
  'Utilities',
  'Maintenance',
  'Supplies',
  'Equipment',
  'Transport',
  'Events',
  'Other',
] as const;

export const STAFF_TYPES = [
  'Lecturer',
  'HOD',
  'Admin',
  'Board',
  'Provost',
] as const;

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** The API sends money as number or numeric string; anything else is 0. */
export function toAmount(value: number | string | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNaira(value: number | string | null | undefined): string {
  return nairaFormatter.format(toAmount(value));
}

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  // Bare YYYY-MM-DD parses as UTC midnight, which shows as the previous day
  // west of UTC; pin it to local midnight instead.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Today as YYYY-MM-DD in local time (toISOString would use UTC). */
export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

import { StatusTone } from '../../../widgets/status-indicator/status-indicator.component';
import { SchoolFeeStatus, StudentDto } from '../executive-api.types';

export type SchoolFeeFilter = 'all' | SchoolFeeStatus;

export const SCHOOL_FEE_FILTER_OPTIONS: {
  label: string;
  value: SchoolFeeFilter;
}[] = [
  { label: 'All Fee Status', value: 'all' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Part Paid', value: 'Part Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
];

/** "Yakub Adebare Ajibade", skipping empty parts. */
export function studentFullName(student: StudentDto): string {
  return (
    [student.first_name, student.other_names, student.last_name]
      .map((part) => part?.trim() ?? '')
      .filter((part) => part.length > 0)
      .join(' ') || '—'
  );
}

/** "NURSING · OND", or whichever of the two is known. */
export function studentDepartmentLine(student: StudentDto): string {
  const programme = student.program?.code || student.program?.name;
  return (
    [student.department?.name, programme]
      .map((part) => part?.trim() ?? '')
      .filter((part) => part.length > 0)
      .join(' · ') || '—'
  );
}

/** The fee status to show. A student with no fee record reads as "No fee set". */
export function schoolFeeStatusText(student: StudentDto): string {
  const fee = student.school_fee;
  if (!fee) {
    return 'No fee set';
  }
  return fee.status?.trim() || (fee.is_paid ? 'Paid' : 'Unpaid');
}

/**
 * Colours the fee status. Any wording with "part" counts as part paid, since
 * the API's exact wording for it is not confirmed. Anything unknown is neutral.
 */
export function schoolFeeTone(status: string): StatusTone {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes('part')) {
    return 'pending';
  }
  if (normalized === 'paid') {
    return 'approved';
  }
  if (normalized === 'unpaid') {
    return 'rejected';
  }
  return 'neutral';
}

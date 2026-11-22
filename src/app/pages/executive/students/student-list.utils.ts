import { StatusTone } from '../../../widgets/status-indicator/status-indicator.component';
import {
  LabelOrRef,
  SchoolFeeStatus,
  StudentDto,
} from '../executive-api.types';

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

const FEE_STATUS_TONES: Record<SchoolFeeStatus, StatusTone> = {
  Paid: 'approved',
  'Part Paid': 'pending',
  Unpaid: 'rejected',
};

/** An unknown status reads as neutral rather than as paid or owing. */
export function schoolFeeTone(status: string): StatusTone {
  return FEE_STATUS_TONES[status as SchoolFeeStatus] ?? 'neutral';
}

/** The text to show for a field that may be a plain label or a related record. */
export function labelOf(value: LabelOrRef): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }
  return (value.name ?? value.title ?? value.code ?? '').trim();
}

/** "Nursing · General Nursing", or whichever of the two is known. */
export function studentDepartmentLine(student: StudentDto): string {
  return (
    [labelOf(student.department), labelOf(student.programme)]
      .filter((part) => part.length > 0)
      .join(' · ') || '—'
  );
}

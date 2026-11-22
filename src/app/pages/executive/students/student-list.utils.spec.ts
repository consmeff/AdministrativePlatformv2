import { StudentDto } from '../executive-api.types';
import {
  labelOf,
  schoolFeeTone,
  studentDepartmentLine,
} from './student-list.utils';

describe('student list utils', () => {
  const student: StudentDto = {
    id: 1,
    matric_no: 'CONSMMEFS/NSG/2025/0017',
    full_name: 'Yakub Ajibade',
    email: null,
    department: 'Nursing',
    programme: 'General Nursing',
    level: '200',
    session: '2025/26',
    school_fee_total: '350000.00',
    school_fee_paid: '150000.00',
    school_fee_balance: '200000.00',
    school_fee_status: 'Part Paid',
    last_payment_date: '2026-11-01',
  };

  it('colours each school-fee status', () => {
    expect(schoolFeeTone('Paid')).toBe('approved');
    expect(schoolFeeTone('Part Paid')).toBe('pending');
    expect(schoolFeeTone('Unpaid')).toBe('rejected');
  });

  it('shows an unknown status as neutral, not as paid', () => {
    expect(schoolFeeTone('Waived')).toBe('neutral');
  });

  it('joins department and programme, skipping missing parts', () => {
    expect(studentDepartmentLine(student)).toBe('Nursing · General Nursing');
    expect(studentDepartmentLine({ ...student, programme: null })).toBe(
      'Nursing',
    );
    expect(
      studentDepartmentLine({ ...student, department: ' ', programme: null }),
    ).toBe('—');
  });

  it('reads the name when the API sends a related record instead of a label', () => {
    expect(
      studentDepartmentLine({
        ...student,
        department: { id: 4, name: 'Nursing' },
        programme: { id: 9, title: 'General Nursing' },
      }),
    ).toBe('Nursing · General Nursing');
    expect(labelOf({ id: 2, code: '200' })).toBe('200');
    expect(labelOf(200)).toBe('200');
    expect(labelOf(null)).toBe('');
  });
});

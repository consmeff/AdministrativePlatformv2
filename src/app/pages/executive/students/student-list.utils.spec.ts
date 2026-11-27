import { StudentDto } from '../executive-api.types';
import {
  schoolFeeStatusText,
  schoolFeeTone,
  studentDepartmentLine,
  studentFullName,
} from './student-list.utils';

describe('student list utils', () => {
  // Trimmed from a real GET /api/v1/students item.
  const student: StudentDto = {
    id: 1895,
    matriculation_number: 'CONSMMEFS/ENT-2026/0026',
    first_name: 'Yakub',
    last_name: 'Ajibade',
    other_names: 'Adebare',
    email: 'student@example.com',
    phone_number: '+2348000000000',
    level: { id: 2, name: '100 Level' },
    semester: { id: 1, name: '1st Semester' },
    session: null,
    department: { id: 1, name: 'NURSING', code: 'NRS' },
    program: { id: 1, name: 'Ordinary National Diploma', code: 'OND' },
    school_fee: {
      fee_id: 4,
      amount: 1000000.0,
      amount_paid: 0.0,
      balance: 1000000.0,
      status: 'Unpaid',
      is_paid: false,
    },
  };

  it('builds the full name and skips an empty middle name', () => {
    expect(studentFullName(student)).toBe('Yakub Adebare Ajibade');
    expect(studentFullName({ ...student, other_names: '' })).toBe(
      'Yakub Ajibade',
    );
  });

  it('shows the department with the programme code', () => {
    expect(studentDepartmentLine(student)).toBe('NURSING · OND');
    expect(studentDepartmentLine({ ...student, program: null })).toBe(
      'NURSING',
    );
    expect(
      studentDepartmentLine({ ...student, department: null, program: null }),
    ).toBe('—');
  });

  it('reads the fee status, falling back to is_paid, then to "No fee set"', () => {
    expect(schoolFeeStatusText(student)).toBe('Unpaid');
    expect(
      schoolFeeStatusText({
        ...student,
        school_fee: { ...student.school_fee!, status: '', is_paid: true },
      }),
    ).toBe('Paid');
    expect(schoolFeeStatusText({ ...student, school_fee: null })).toBe(
      'No fee set',
    );
  });

  it('colours each fee status, whatever the part-paid wording', () => {
    expect(schoolFeeTone('Paid')).toBe('approved');
    expect(schoolFeeTone('Unpaid')).toBe('rejected');
    expect(schoolFeeTone('Part Paid')).toBe('pending');
    expect(schoolFeeTone('Partially Paid')).toBe('pending');
    expect(schoolFeeTone('No fee set')).toBe('neutral');
  });
});

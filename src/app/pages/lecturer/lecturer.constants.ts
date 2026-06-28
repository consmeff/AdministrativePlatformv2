import {
  LecturerCourse,
  LecturerProfile,
  LecturerStudentResult,
} from './lecturer.types';

const GRADE_SCALE = [
  { minimumScore: 70, grade: 'A' },
  { minimumScore: 60, grade: 'B' },
  { minimumScore: 50, grade: 'C' },
  { minimumScore: 45, grade: 'D' },
  { minimumScore: 40, grade: 'E' },
] as const;

const RESULT_TEMPLATE_HEADERS = [
  'Student Name',
  'Matric No.',
  'C.A.',
  'Exam',
] as const;

const STUDENT_NAME_SEQUENCE = [
  'Ishola Dada',
  'Amaka Obi',
  'Bamidele Yusuf',
  'Yetunde Afolabi',
  'Chinonso Eze',
  'Fatima Sani',
  'Kunle Ojo',
  'Aisha Bello',
  'Daniel Nwosu',
  'Mercy Okafor',
] as const;

const COURSE_UPLOAD_STAGE = {
  upload: 'upload',
  fileSelected: 'file-selected',
  processing: 'processing',
  complete: 'complete',
} as const;

export const LECTURER_FALLBACK_SESSION_LABEL = 'Current Session';
export const LECTURER_FALLBACK_LEVEL_LABEL = 'Assigned Course';
export const LECTURER_SEMESTER_LABEL_BY_VALUE: Record<string, string> = {
  first_semester: '1st Semester',
  second_semester: '2nd Semester',
};
export const LECTURER_LEVEL_LABEL_BY_COURSE_PREFIX: Record<string, string> = {
  '1': 'OND 1',
  '2': 'OND 2',
  '3': 'HND 1',
  '4': 'HND 2',
};
export const LECTURER_GRADE_SCALE = GRADE_SCALE;

export function resolveLecturerGrade(totalScore: number): string {
  const matchedGrade = GRADE_SCALE.find(
    (entry) => totalScore >= entry.minimumScore,
  );

  return matchedGrade?.grade ?? 'F';
}

function createStudent(index: number): LecturerStudentResult {
  const studentNumber = index + 1;
  const continuousAssessmentScore = 14 + (index % 7);
  const examScore = 48 + (index % 18);
  const totalScore = continuousAssessmentScore + examScore;
  const name = STUDENT_NAME_SEQUENCE[index % STUDENT_NAME_SEQUENCE.length];
  const paddedStudentNumber = String(studentNumber).padStart(3, '0');

  return {
    id: `student-${paddedStudentNumber}`,
    studentId: null,
    studentName: `Gbadegesin ${name}`,
    matricNo: `CONSMMEFS/ENT-2025/${paddedStudentNumber}`,
    continuousAssessmentScore,
    examScore,
    totalScore,
    grade: resolveLecturerGrade(totalScore),
  };
}

export function buildLecturerStudents(
  studentCount: number,
  startIndex = 0,
): LecturerStudentResult[] {
  return Array.from({ length: studentCount }, (_, index) =>
    createStudent(startIndex + index),
  );
}

export const LECTURER_PROFILE: LecturerProfile = {
  fullName: 'Staff Member',
  roleLabel: 'Staff',
  departmentLabel: 'Department',
  facultyLabel: 'Faculty',
  emailAddress: '-',
  phoneNumber: '-',
  officeLocation: '-',
};

export const LECTURER_COURSES: LecturerCourse[] = [
  {
    id: 'nur-201-human-anatomy-iii',
    code: 'NUR 201',
    title: 'Human Anatomy III',
    levelLabel: 'OND 2',
    units: 3,
    sessionLabel: '2025 / 2026',
    semesterLabel: '1st Semester',
    departmentLabel: 'Nursing Science',
    students: buildLecturerStudents(54),
    uploadSummary: {
      lastUploadedAt: null,
      successMessage: null,
    },
  },
  {
    id: 'nur-203-foundation-of-nursing',
    code: 'NUR 203',
    title: 'Foundation of Nursing',
    levelLabel: 'OND 2',
    units: 2,
    sessionLabel: '2025 / 2026',
    semesterLabel: '1st Semester',
    departmentLabel: 'Nursing Science',
    students: buildLecturerStudents(42, 54),
    uploadSummary: {
      lastUploadedAt: '12 Jun 2026, 10:30 AM',
      successMessage: '42 rows processed successfully.',
    },
  },
  {
    id: 'nur-205-community-health-practice',
    code: 'NUR 205',
    title: 'Community Health Practice',
    levelLabel: 'OND 2',
    units: 3,
    sessionLabel: '2025 / 2026',
    semesterLabel: '1st Semester',
    departmentLabel: 'Nursing Science',
    students: [],
    uploadSummary: {
      lastUploadedAt: null,
      successMessage: null,
    },
  },
  {
    id: 'nur-207-clinical-ethics',
    code: 'NUR 207',
    title: 'Clinical Ethics',
    levelLabel: 'OND 2',
    units: 2,
    sessionLabel: '2025 / 2026',
    semesterLabel: '1st Semester',
    departmentLabel: 'Nursing Science',
    students: buildLecturerStudents(36, 96),
    uploadSummary: {
      lastUploadedAt: null,
      successMessage: null,
    },
  },
];

export const LECTURER_UPLOAD_STAGE = COURSE_UPLOAD_STAGE;
export const LECTURER_RESULT_TEMPLATE_HEADERS = RESULT_TEMPLATE_HEADERS;
export const LECTURER_UPLOAD_ACCEPTED_FILE_TYPES = '.csv,.xls,.xlsx';
export const LECTURER_DEFAULT_RESULT_TEMPLATE_NAME =
  'student-results-template.csv';
export const LECTURER_UPLOAD_PROGRESS_INTERVAL_MS = 160;
export const LECTURER_UPLOAD_PROGRESS_STEP = 8;

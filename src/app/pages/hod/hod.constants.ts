import {
  HodCourseRegistrationRecord,
  HodDocumentVerificationRecord,
  HodLecturer,
  HodLecturerAssignmentHistoryRecord,
  HodLecturerCourse,
  HodLevelFilterOption,
  HodProgrammeFilterOption,
  HodProfile,
  HodRegisteredCourse,
  HodResultReviewRecord,
  HodResultStudentRow,
  HodStudentRecord,
  HodStudentRecordDocument,
  HodStudentSemesterPerformance,
} from './hod.types';

const HOD_DOCUMENT_NAMES = [
  'Secondary School Testimonial',
  'Letter of Recommendation 1',
  'Letter of Recommendation 2',
] as const;

const HOD_RESULT_REVIEW_COURSES = [
  {
    courseTitle: 'Advanced Clinical Nursing Practice',
    courseCode: 'NSG 401',
    submittedBy: 'Dr. Amira Gbadegesin',
  },
  {
    courseTitle: 'Community Health Nursing',
    courseCode: 'NSG 312',
    submittedBy: 'Prof. Ifeoma Bassey',
  },
  {
    courseTitle: 'Pharmacology for Nurses',
    courseCode: 'NSG 214',
    submittedBy: 'Mr. Kayode Adeniyi',
  },
  {
    courseTitle: 'Medical Surgical Nursing',
    courseCode: 'NSG 326',
    submittedBy: 'Mrs. Rachel Edeh',
  },
] as const;

const HOD_STUDENT_NAMES = [
  'Adebayo, Sarah Olamide',
  'Ishola, Gbadesin Hassan',
  'Oluwaseun, Mercy Aina',
  'Yakubu, Daniel Tobi',
  'Ekanem, Blessing Ini',
  'Nwosu, Chiamaka Grace',
  'Akinola, Esther Fiyin',
  'Okafor, Emmanuel Chuka',
  'Abdullahi, Maryam Bello',
  'Ajayi, Deborah Teniola',
] as const;

const HOD_STUDENT_DOCUMENT_NAMES = [
  'Admission Letter',
  'Birth Certificate',
  'State of Origin Certificate',
  'Transcript Statement',
] as const;

const HOD_LECTURER_NAMES = [
  'Dr. Amira Gbadegesin',
  'Prof. Ifeoma Bassey',
  'Mr. Kayode Adeniyi',
  'Mrs. Rachel Edeh',
  'Dr. Daniel Udeh',
  'Dr. Halima Sani',
  'Mr. Tunde Afolabi',
  'Mrs. Nkem Chukwu',
  'Dr. Maryam Bello',
] as const;

const HOD_LECTURER_COURSE_DEFINITIONS = [
  {
    code: 'NUR 211',
    title: 'Human Anatomy III',
    units: 3,
    levelValue: 'ond_1',
    levelLabel: 'OND 1',
  },
  {
    code: 'NUR 212',
    title: 'General Physiology',
    units: 3,
    levelValue: 'ond_1',
    levelLabel: 'OND 1',
  },
  {
    code: 'NUR 213',
    title: 'Foundations of Nursing Practice',
    units: 2,
    levelValue: 'ond_1',
    levelLabel: 'OND 1',
  },
  {
    code: 'NUR 214',
    title: 'Nutrition in Nursing',
    units: 3,
    levelValue: 'ond_1',
    levelLabel: 'OND 1',
  },
  {
    code: 'NUR 215',
    title: 'Introduction to Pharmacology',
    units: 3,
    levelValue: 'ond_1',
    levelLabel: 'OND 1',
  },
  {
    code: 'NUR 321',
    title: 'Maternal and Child Nursing',
    units: 3,
    levelValue: 'hnd_1',
    levelLabel: 'HND 1',
  },
  {
    code: 'NUR 322',
    title: 'Community Health Practice',
    units: 2,
    levelValue: 'hnd_1',
    levelLabel: 'HND 1',
  },
  {
    code: 'NUR 323',
    title: 'Medical Surgical Nursing',
    units: 3,
    levelValue: 'hnd_1',
    levelLabel: 'HND 1',
  },
] as const;

function buildLecturerAssignmentHistoryRecord(
  index: number,
  action: HodLecturerAssignmentHistoryRecord['action'],
): HodLecturerAssignmentHistoryRecord {
  const lecturerName = HOD_LECTURER_NAMES[index % HOD_LECTURER_NAMES.length];
  const courseDefinition =
    HOD_LECTURER_COURSE_DEFINITIONS[
      index % HOD_LECTURER_COURSE_DEFINITIONS.length
    ];

  return {
    id: `hod-lecturer-history-${index + 1}`,
    courseId: `hod-lecturer-course-${(index % HOD_LECTURER_COURSE_DEFINITIONS.length) + 1}`,
    courseCode: courseDefinition.code,
    courseTitle: courseDefinition.title,
    lecturerId: `hod-lecturer-${(index % HOD_LECTURER_NAMES.length) + 1}`,
    lecturerName,
    action,
    changedAt: `${24 - (index % 5)} Jan 2026 1${index % 10}:15 AM`,
  };
}

function buildLecturerCourse(
  index: number,
  assignedLecturerIds: string[],
): HodLecturerCourse {
  const courseDefinition = HOD_LECTURER_COURSE_DEFINITIONS[index];

  return {
    id: `hod-lecturer-course-${index + 1}`,
    code: courseDefinition.code,
    title: courseDefinition.title,
    units: courseDefinition.units,
    levelValue: courseDefinition.levelValue,
    levelLabel: courseDefinition.levelLabel,
    assignedLecturerIds,
  };
}

function buildLecturer(
  index: number,
  assignedCourseIds: string[],
): HodLecturer {
  const lecturerName = HOD_LECTURER_NAMES[index];
  const normalizedName = lecturerName.toLowerCase().replace(/[^a-z]+/g, '.');

  return {
    id: `hod-lecturer-${index + 1}`,
    fullName: lecturerName,
    staffId: `CONSMMEFS/STF/2019/${String(index + 14).padStart(4, '0')}`,
    emailAddress: `${normalizedName}@consmmefs.edu.ng`,
    phoneNumber: `0809 ${String(2813200 + index * 53).slice(0, 3)} ${String(2813200 + index * 53).slice(3)}`,
    assignedCourseIds,
  };
}

function buildResultStudentRows(resultIndex: number): HodResultStudentRow[] {
  return Array.from({ length: 8 }, (_, studentIndex) => {
    const studentName =
      HOD_STUDENT_NAMES[
        (resultIndex + studentIndex) % HOD_STUDENT_NAMES.length
      ];
    const continuousAssessmentScore =
      18 + ((resultIndex * 3 + studentIndex * 5) % 12);
    const examScore = 31 + ((resultIndex * 7 + studentIndex * 4) % 36);
    const totalScore = continuousAssessmentScore + examScore;

    return {
      id: `hod-result-student-${resultIndex + 1}-${studentIndex + 1}`,
      studentName,
      matricNo: `NSG/2025/${String(resultIndex * 8 + studentIndex + 17).padStart(4, '0')}`,
      continuousAssessmentScore,
      examScore,
      totalScore,
      grade: resolveGrade(totalScore),
    };
  });
}

function resolveGrade(totalScore: number): string {
  if (totalScore >= 70) {
    return 'A';
  }

  if (totalScore >= 60) {
    return 'B';
  }

  if (totalScore >= 50) {
    return 'C';
  }

  if (totalScore >= 45) {
    return 'D';
  }

  if (totalScore >= 40) {
    return 'E';
  }

  return 'F';
}

function buildResultReviewRecord(
  index: number,
  approved: boolean,
): HodResultReviewRecord {
  const course =
    HOD_RESULT_REVIEW_COURSES[index % HOD_RESULT_REVIEW_COURSES.length];
  const studentRows = buildResultStudentRows(index);
  const passedStudents = studentRows.filter(
    (studentRow) => studentRow.totalScore >= 40,
  ).length;

  return {
    id: `hod-result-review-${index + 1}`,
    courseTitle: course.courseTitle,
    courseCode: course.courseCode,
    submittedBy: course.submittedBy,
    programmeType: index % 2 === 0 ? 'OND' : 'HND',
    levelLabel: index % 2 === 0 ? 'OND 2' : 'HND 1',
    submittedAt: '24 Jan 2026 22:58 AM',
    totalStudents: studentRows.length,
    passedStudents,
    failedStudents: studentRows.length - passedStudents,
    approved,
    studentRows,
  };
}

function buildStudentDocuments(index: number): HodStudentRecordDocument[] {
  return HOD_STUDENT_DOCUMENT_NAMES.map((documentName, documentIndex) => ({
    id: `hod-student-document-${index + 1}-${documentIndex + 1}`,
    name: documentName,
    fileSizeLabel: `${104 + documentIndex * 12}kb`,
    previewUrl: 'assets/doc.png',
  }));
}

function buildStudentAcademicPerformance(
  index: number,
): HodStudentSemesterPerformance[] {
  return [
    {
      id: `hod-student-performance-${index + 1}-1`,
      levelLabel: 'OND 1',
      semesterLabel: 'First Semester',
      gpa: Number((3.1 + (index % 4) * 0.12).toFixed(2)),
    },
    {
      id: `hod-student-performance-${index + 1}-2`,
      levelLabel: 'OND 1',
      semesterLabel: 'Second Semester',
      gpa: Number((3.24 + (index % 3) * 0.13).toFixed(2)),
    },
    {
      id: `hod-student-performance-${index + 1}-3`,
      levelLabel: 'OND 2',
      semesterLabel: 'First Semester',
      gpa: Number((3.35 + (index % 5) * 0.09).toFixed(2)),
    },
    {
      id: `hod-student-performance-${index + 1}-4`,
      levelLabel: 'OND 2',
      semesterLabel: 'Second Semester',
      gpa: Number((3.42 + (index % 4) * 0.1).toFixed(2)),
    },
  ];
}

function buildStudentRecord(index: number): HodStudentRecord {
  const studentName = HOD_STUDENT_NAMES[index % HOD_STUDENT_NAMES.length];
  const programmeType = index % 2 === 0 ? 'OND' : 'HND';
  const levelLabel = index % 2 === 0 ? 'OND 2' : 'HND 1';
  const cgpa = Number((3.22 + (index % 6) * 0.11).toFixed(2));

  return {
    id: `hod-student-record-${index + 1}`,
    studentName,
    matricNumber: `CONSMMEFS/NSG/2025/${String(index + 17).padStart(4, '0')}`,
    levelLabel,
    programmeType,
    cgpa,
    emailAddress: `student${index + 1}@consmmef.edu.ng`,
    phoneNumber: `0803${String(4567000 + index * 27).padStart(7, '0')}`,
    alternatePhoneNumber: `0706${String(1284300 + index * 19).padStart(7, '0')}`,
    dateOfBirth: '14 Feb 2005',
    gender: index % 3 === 0 ? 'Male' : 'Female',
    admissionSession: '2025/2026',
    currentLevel: levelLabel,
    maritalStatus: 'Single',
    nationality: 'Nigerian',
    stateOfOrigin: index % 2 === 0 ? 'Lagos' : 'Akwa Ibom',
    localGovernmentArea: index % 2 === 0 ? 'Ikeja' : 'Uyo',
    disabilityStatus: index % 5 === 0 ? 'Yes' : 'No',
    specifiedDisability: index % 5 === 0 ? 'Visual Impairment' : 'Nil',
    address: '12 College Road, Off Medical Hostel, Abeokuta',
    cumulativeGpaLabel: cgpa.toFixed(2),
    cumulativeClassLabel:
      cgpa >= 3.5 ? 'Distinction' : cgpa >= 3 ? 'Upper Credit' : 'Lower Credit',
    academicPerformance: buildStudentAcademicPerformance(index),
    documents: buildStudentDocuments(index),
  };
}

function buildRegisteredCourses(courseCount: number): HodRegisteredCourse[] {
  return Array.from({ length: courseCount }, (_, index) => ({
    code: `NUR ${101 + index}`,
    title:
      index % 2 === 0 ? 'Introduction to Nursing' : 'General Human Anatomy',
    units: index < 3 ? 3 : 2,
  }));
}

function buildCourseRegistrationRecord(
  index: number,
  status: HodCourseRegistrationRecord['status'],
): HodCourseRegistrationRecord {
  const studentNumber = String(index + 6).padStart(4, '0');
  const courseCount = status === 'rejected' ? 4 : 9;
  const totalUnits = status === 'rejected' ? 16 : 21;

  return {
    id: `hod-course-registration-${index + 1}`,
    studentName: 'Gbadegesin Ishola Dada',
    registrationNumber: `CONSMMEFS/ENT-2025/${studentNumber}`,
    programmeType: index % 2 === 0 ? 'OND' : 'HND',
    levelLabel: index % 2 === 0 ? 'OND 1' : 'HND 1',
    courseCount,
    totalUnits,
    coreCourseCount: 4,
    status,
    submittedAt: '24 Jan 2026 22:58 AM',
    registeredCourses: buildRegisteredCourses(courseCount),
  };
}

function buildDocumentVerificationRecord(
  index: number,
  status: HodDocumentVerificationRecord['status'],
): HodDocumentVerificationRecord {
  const studentNumber = String(index + 6).padStart(4, '0');

  return {
    id: `hod-document-verification-${index + 1}`,
    studentName: 'ISHOLA, Gbadesin Hassan',
    registrationNumber: `CONSMMEFS/ENT-2025/${studentNumber}`,
    programmeType: index % 2 === 0 ? 'OND' : 'HND',
    levelLabel: index % 2 === 0 ? 'OND' : 'HND',
    submittedAt: '24 Jan 2026 22:58 AM',
    status,
    documents: HOD_DOCUMENT_NAMES.map((documentName, documentIndex) => ({
      id: `hod-document-${index + 1}-${documentIndex + 1}`,
      name: documentName,
      fileSizeLabel: '104kb',
      previewUrl: 'assets/doc.png',
    })),
    flag:
      status === 'flagged'
        ? {
            affectedDocuments: ['Secondary School Testimonial'],
            reason: 'Wrong File Uploaded',
            note: 'Please upload a clearer document copy.',
            flaggedAt: '24 Jan 2026 22:58 AM',
          }
        : null,
  };
}

export const HOD_PROFILE: HodProfile = {
  fullName: 'Dr. Amira Gbadegesin',
  roleLabel: 'Head of Department',
  departmentLabel: 'Nursing Science',
  facultyLabel: 'School of Nursing',
  emailAddress: 'amira.gbadegesin@consmmef.edu.ng',
  officeLocation: 'Faculty Building, Room 204',
};

export const HOD_PROGRAMME_FILTER_OPTIONS: HodProgrammeFilterOption[] = [
  { label: 'All Programme', value: 'all' },
  { label: 'OND', value: 'OND' },
  { label: 'HND', value: 'HND' },
];

export const HOD_LEVEL_FILTER_OPTIONS: HodLevelFilterOption[] = [
  { label: 'OND 1', value: 'ond_1' },
  { label: 'HND 1', value: 'hnd_1' },
];

export const HOD_FLAG_REASON_OPTIONS = [
  'Wrong File Uploaded',
  'Blurry Document',
  'Name Mismatch',
  'Others',
] as const;

export const HOD_FLAG_DOCUMENT_OPTIONS = [...HOD_DOCUMENT_NAMES];

export const HOD_COURSE_REGISTRATION_RECORDS: HodCourseRegistrationRecord[] = [
  ...Array.from({ length: 9 }, (_, index) =>
    buildCourseRegistrationRecord(index, 'pending_review'),
  ),
  ...Array.from({ length: 6 }, (_, index) =>
    buildCourseRegistrationRecord(index + 9, 'resubmitted'),
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    buildCourseRegistrationRecord(index + 15, 'rejected'),
  ),
];

export const HOD_DOCUMENT_VERIFICATION_RECORDS: HodDocumentVerificationRecord[] =
  [
    ...Array.from({ length: 15 }, (_, index) =>
      buildDocumentVerificationRecord(index, 'pending'),
    ),
    ...Array.from({ length: 8 }, (_, index) =>
      buildDocumentVerificationRecord(index + 15, 'flagged'),
    ),
  ];

export const HOD_RESULT_REVIEW_RECORDS: HodResultReviewRecord[] = [
  ...Array.from({ length: 6 }, (_, index) =>
    buildResultReviewRecord(index, false),
  ),
  ...Array.from({ length: 4 }, (_, index) =>
    buildResultReviewRecord(index + 6, true),
  ),
];

export const HOD_STUDENT_RECORDS: HodStudentRecord[] = Array.from(
  { length: 18 },
  (_, index) => buildStudentRecord(index),
);

export const HOD_LECTURER_COURSES: HodLecturerCourse[] = [
  buildLecturerCourse(0, []),
  buildLecturerCourse(1, ['hod-lecturer-1']),
  buildLecturerCourse(2, ['hod-lecturer-1', 'hod-lecturer-4']),
  buildLecturerCourse(3, []),
  buildLecturerCourse(4, ['hod-lecturer-2', 'hod-lecturer-6']),
  buildLecturerCourse(5, ['hod-lecturer-3']),
  buildLecturerCourse(6, ['hod-lecturer-5']),
  buildLecturerCourse(7, ['hod-lecturer-7', 'hod-lecturer-9']),
];

export const HOD_LECTURERS: HodLecturer[] = [
  buildLecturer(0, [
    'hod-lecturer-course-2',
    'hod-lecturer-course-3',
    'hod-lecturer-course-6',
  ]),
  buildLecturer(1, ['hod-lecturer-course-5']),
  buildLecturer(2, ['hod-lecturer-course-6']),
  buildLecturer(3, ['hod-lecturer-course-3']),
  buildLecturer(4, ['hod-lecturer-course-7']),
  buildLecturer(5, ['hod-lecturer-course-5']),
  buildLecturer(6, ['hod-lecturer-course-8']),
  buildLecturer(7, []),
  buildLecturer(8, ['hod-lecturer-course-8']),
];

export const HOD_LECTURER_ASSIGNMENT_HISTORY: HodLecturerAssignmentHistoryRecord[] =
  [
    buildLecturerAssignmentHistoryRecord(0, 'assigned'),
    buildLecturerAssignmentHistoryRecord(1, 'removed'),
    buildLecturerAssignmentHistoryRecord(2, 'assigned'),
    buildLecturerAssignmentHistoryRecord(3, 'assigned'),
  ];

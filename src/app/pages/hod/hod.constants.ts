import {
  HodCourseRegistrationRecord,
  HodDocumentVerificationRecord,
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

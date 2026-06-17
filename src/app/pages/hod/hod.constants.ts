import {
  HodCourseRegistrationRecord,
  HodDocumentVerificationRecord,
  HodProgrammeFilterOption,
  HodProfile,
  HodRegisteredCourse,
} from './hod.types';

const HOD_DOCUMENT_NAMES = [
  'Secondary School Testimonial',
  'Letter of Recommendation 1',
  'Letter of Recommendation 2',
] as const;

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

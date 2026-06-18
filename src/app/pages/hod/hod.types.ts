export interface HodProfile {
  fullName: string;
  roleLabel: string;
  departmentLabel: string;
  facultyLabel: string;
  emailAddress: string;
  officeLocation: string;
}

export interface HodProgrammeFilterOption {
  label: string;
  value: string;
}

export interface HodLevelFilterOption {
  label: string;
  value: string;
}

export type HodRegistrationStatus =
  | 'pending_review'
  | 'resubmitted'
  | 'rejected'
  | 'approved';

export interface HodRegisteredCourse {
  code: string;
  title: string;
  units: number;
}

export interface HodCourseRegistrationRecord {
  id: string;
  studentName: string;
  registrationNumber: string;
  programmeType: string;
  levelLabel: string;
  courseCount: number;
  totalUnits: number;
  coreCourseCount: number;
  status: HodRegistrationStatus;
  submittedAt: string;
  registeredCourses: HodRegisteredCourse[];
}

export interface HodVerificationDocument {
  id: string;
  name: string;
  fileSizeLabel: string;
  previewUrl: string;
}

export type HodDocumentVerificationStatus = 'pending' | 'flagged' | 'verified';

export interface HodDocumentFlag {
  affectedDocuments: string[];
  reason: string;
  note: string;
  flaggedAt: string;
}

export interface HodDocumentVerificationRecord {
  id: string;
  studentName: string;
  registrationNumber: string;
  programmeType: string;
  levelLabel: string;
  submittedAt: string;
  status: HodDocumentVerificationStatus;
  documents: HodVerificationDocument[];
  flag: HodDocumentFlag | null;
}

export interface HodResultStudentRow {
  id: string;
  studentName: string;
  matricNo: string;
  continuousAssessmentScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
}

export interface HodResultReviewRecord {
  id: string;
  courseTitle: string;
  courseCode: string;
  submittedBy: string;
  programmeType: string;
  levelLabel: string;
  submittedAt: string;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  approved: boolean;
  studentRows: HodResultStudentRow[];
}

export interface HodStudentRecordDocument {
  id: string;
  name: string;
  fileSizeLabel: string;
  previewUrl: string;
}

export interface HodStudentSemesterPerformance {
  id: string;
  levelLabel: string;
  semesterLabel: string;
  gpa: number;
}

export interface HodStudentRecord {
  id: string;
  studentName: string;
  matricNumber: string;
  levelLabel: string;
  programmeType: string;
  cgpa: number;
  emailAddress: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  dateOfBirth: string;
  gender: string;
  admissionSession: string;
  currentLevel: string;
  maritalStatus: string;
  nationality: string;
  stateOfOrigin: string;
  localGovernmentArea: string;
  disabilityStatus: string;
  specifiedDisability: string;
  address: string;
  cumulativeGpaLabel: string;
  cumulativeClassLabel: string;
  academicPerformance: HodStudentSemesterPerformance[];
  documents: HodStudentRecordDocument[];
}

export type HodStudentRecordDrawerTab =
  | 'personal_details'
  | 'academic_performance'
  | 'documents';

export interface HodLecturer {
  id: string;
  fullName: string;
  staffId: string;
  emailAddress: string;
  phoneNumber: string;
  assignedCourseIds: string[];
}

export interface HodLecturerCourse {
  id: string;
  code: string;
  title: string;
  units: number;
  levelValue: string;
  levelLabel: string;
  assignedLecturerIds: string[];
}

export interface HodLecturerAssignmentHistoryRecord {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lecturerId: string;
  lecturerName: string;
  action: 'assigned' | 'removed';
  changedAt: string;
}

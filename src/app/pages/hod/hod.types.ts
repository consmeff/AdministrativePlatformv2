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

export interface LecturerStudentResult {
  id: string;
  studentName: string;
  matricNo: string;
  continuousAssessmentScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
}

export interface LecturerCourseUploadSummary {
  lastUploadedAt: string | null;
  successMessage: string | null;
}

export interface LecturerCourse {
  id: string;
  code: string;
  title: string;
  levelLabel: string;
  units: number;
  sessionLabel: string;
  semesterLabel: string;
  departmentLabel: string;
  students: LecturerStudentResult[];
  uploadSummary: LecturerCourseUploadSummary;
}

export interface LecturerProfile {
  fullName: string;
  roleLabel: string;
  departmentLabel: string;
  facultyLabel: string;
  emailAddress: string;
  phoneNumber: string;
  officeLocation: string;
}

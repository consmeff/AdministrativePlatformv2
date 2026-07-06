export interface LecturerResultsUploadResponse {
  message?: string;
  detail?: string;
  processed_rows?: number;
  processedRows?: number;
  data?: unknown;
}

export interface LecturerCourseSingleResponse {
  data?: unknown;
}

export interface LecturerStudentResultUpdatePayload {
  student_id: number;
  results: {
    course_id: number;
    test_score: number;
    exam_score: number;
    grade: string;
  }[];
}

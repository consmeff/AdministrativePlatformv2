export interface HodCourseRegistrationQuery {
  department?: string;
  level?: string;
  program?: string;
  semester?: string;
}

export interface HodCourseRegistrationDetailQuery {
  student_id: number;
  department_id: number;
  level_id: number;
  semester_id: number;
}

export interface HodCourseRegistrationApprovePayload {
  student_id: number;
  semester_id: number;
  department_id: number;
  level_id: number;
}

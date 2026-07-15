export interface HodCourseResultsQuery {
  department?: string;
  level?: string;
  semester?: string;
}

export interface HodCourseResultsApproveQuery {
  course_id: string;
  department_id: string;
  level_id: string;
  semester_id: string;
}

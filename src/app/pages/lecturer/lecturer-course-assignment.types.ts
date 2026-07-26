import { LecturerCourse } from './lecturer.types';

export interface StaffAssignedCourseApiCourse {
  id: number;
  code: string;
  title: string;
  description: string;
  units: string;
  department: number;
  school_semester: string;
}

export interface StaffAssignedCourseApiItem {
  id: number;
  course: StaffAssignedCourseApiCourse | null;
  lecturer_name: string | null;
  lecturer_email: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  role: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  lecturer: number | null;
}

export interface StaffAssignedCoursesApiResponse {
  data:
    | (StaffAssignedCourseApiItem[] | StaffAssignedCourseApiItem | null)[]
    | null;
}

export interface StaffAssignedCoursesQuery {
  course_id?: string;
  department_id?: string;
  lecturer_id?: string;
}

export interface LecturerAssignedCoursesPayload {
  courses: LecturerCourse[];
  lecturerName: string | null;
  lecturerEmail: string | null;
  roleLabel: string | null;
}

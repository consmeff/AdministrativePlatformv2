import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import {
  LECTURER_FALLBACK_LEVEL_LABEL,
  LECTURER_FALLBACK_SESSION_LABEL,
  LECTURER_LEVEL_LABEL_BY_COURSE_PREFIX,
  LECTURER_PROFILE,
  LECTURER_SEMESTER_LABEL_BY_VALUE,
} from './lecturer.constants';
import {
  LecturerAssignedCoursesPayload,
  StaffAssignedCourseApiItem,
  StaffAssignedCoursesApiResponse,
  StaffAssignedCoursesQuery,
} from './lecturer-course-assignment.types';
import { LecturerCourse } from './lecturer.types';

@Injectable({
  providedIn: 'root',
})
export class LecturerCourseAssignmentService {
  private readonly apiRoot = environment.apiURL;
  private readonly http = inject(HttpClient);

  getAssignedCourses(
    query?: StaffAssignedCoursesQuery,
  ): Observable<LecturerAssignedCoursesPayload> {
    const url = `${this.apiRoot}/api/v1/staffs/courses-assigned`;
    const params = this.buildAssignedCoursesQueryParams(query);

    return this.http
      .get<StaffAssignedCoursesApiResponse>(url, { params })
      .pipe(map((response) => this.mapAssignedCoursesResponse(response)));
  }

  private mapAssignedCoursesResponse(
    response: StaffAssignedCoursesApiResponse,
  ): LecturerAssignedCoursesPayload {
    const items = this.extractAssignedCourseItems(response);
    const firstAssignedCourse = items[0] ?? null;

    return {
      courses: items
        .filter((item) => item.course !== null)
        .map((item) => this.mapAssignedCourseItem(item)),
      lecturerName: firstAssignedCourse?.lecturer_name ?? null,
      lecturerEmail: firstAssignedCourse?.lecturer_email ?? null,
      roleLabel: firstAssignedCourse?.role ?? null,
    };
  }

  private extractAssignedCourseItems(
    response: StaffAssignedCoursesApiResponse,
  ): StaffAssignedCourseApiItem[] {
    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.flatMap((entry) => {
      if (Array.isArray(entry)) {
        return entry.filter(this.isAssignedCourseApiItem);
      }

      return this.isAssignedCourseApiItem(entry) ? [entry] : [];
    });
  }

  private isAssignedCourseApiItem(
    value: StaffAssignedCourseApiItem | StaffAssignedCourseApiItem[] | null,
  ): value is StaffAssignedCourseApiItem {
    return (
      value !== null && !Array.isArray(value) && value.course !== undefined
    );
  }

  private mapAssignedCourseItem(
    item: StaffAssignedCourseApiItem,
  ): LecturerCourse {
    const course = item.course!;

    return {
      id: String(course.id),
      code: course.code,
      title: course.title,
      levelLabel: this.resolveLevelLabel(course.code),
      units: this.resolveUnits(course.units),
      sessionLabel: this.resolveSessionLabel(item.created_at),
      semesterLabel:
        LECTURER_SEMESTER_LABEL_BY_VALUE[course.school_semester] ??
        course.school_semester,
      departmentLabel: LECTURER_PROFILE.departmentLabel,
      students: [],
      uploadSummary: {
        lastUploadedAt: null,
        successMessage: null,
      },
    };
  }

  private resolveUnits(rawUnits: string): number {
    const parsedUnits = Number(rawUnits);

    return Number.isFinite(parsedUnits) ? parsedUnits : 0;
  }

  private buildAssignedCoursesQueryParams(
    query?: StaffAssignedCoursesQuery,
  ): HttpParams {
    let params = new HttpParams();

    if (query?.course_id) {
      params = params.set('course_id', query.course_id);
    }
    if (query?.department_id) {
      params = params.set('department_id', query.department_id);
    }
    if (query?.lecturer_id) {
      params = params.set('lecturer_id', query.lecturer_id);
    }

    return params;
  }

  private resolveSessionLabel(createdAt: string): string {
    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return LECTURER_FALLBACK_SESSION_LABEL;
    }

    const currentYear = createdDate.getFullYear();
    const currentMonth = createdDate.getMonth();
    const sessionStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;

    return `${sessionStartYear} / ${sessionStartYear + 1}`;
  }

  private resolveLevelLabel(courseCode: string): string {
    const matchedLevelDigit = courseCode.match(/\d/)?.[0] ?? null;

    if (!matchedLevelDigit) {
      return LECTURER_FALLBACK_LEVEL_LABEL;
    }

    return (
      LECTURER_LEVEL_LABEL_BY_COURSE_PREFIX[matchedLevelDigit] ??
      LECTURER_FALLBACK_LEVEL_LABEL
    );
  }
}

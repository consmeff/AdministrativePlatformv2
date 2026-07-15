import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HodResultStudentRow, HodResultReviewRecord } from '../hod.types';
import {
  HodCourseResultsApproveQuery,
  HodCourseResultsQuery,
} from './hod-result-review-api.types';

type UnknownRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class HodResultReviewService {
  private readonly apiRoot = environment.apiURL;
  private readonly http = inject(HttpClient);

  getCourseResults(
    query?: HodCourseResultsQuery,
  ): Observable<HodResultReviewRecord[]> {
    const url = `${this.apiRoot}/api/v1/staffs/course-results`;
    const params = this.buildCourseResultsQueryParams(query);
    return this.http
      .get<unknown>(url, { params })
      .pipe(map((response) => this.mapCourseResultsResponse(response)));
  }

  approveCourseResults(
    query: HodCourseResultsApproveQuery,
  ): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/staffs/course-results/approve`;
    const params = new HttpParams()
      .set('course_id', query.course_id)
      .set('department_id', query.department_id)
      .set('level_id', query.level_id)
      .set('semester_id', query.semester_id);
    return this.http.post(url, null, { params });
  }

  getCourseResultsDetail(courseId: number): Observable<HodResultStudentRow[]> {
    const url = `${this.apiRoot}/api/v1/staffs/course-results/detail`;
    const params = new HttpParams().set('course_id', String(courseId));
    return this.http
      .get<unknown>(url, { params })
      .pipe(map((response) => this.mapCourseResultsDetailResponse(response)));
  }

  private mapCourseResultsResponse(response: unknown): HodResultReviewRecord[] {
    const responseData = this.extractResponseData(response);
    const listCandidate =
      this.extractArrayCandidate(responseData) ??
      this.extractArrayCandidate(response) ??
      [];

    return listCandidate
      .map((entry, index) => this.mapCourseResultReviewRecord(entry, index))
      .filter((record): record is HodResultReviewRecord => record !== null);
  }

  private mapCourseResultsDetailResponse(
    response: unknown,
  ): HodResultStudentRow[] {
    const responseData = this.extractResponseData(response);
    const dataCandidate = responseData ?? response;
    const listCandidate = this.extractArrayCandidate(dataCandidate);

    if (!listCandidate) {
      return [];
    }

    return listCandidate
      .map((entry, index) => this.mapStudentRow(entry, index))
      .filter((row): row is HodResultStudentRow => row !== null);
  }

  private mapCourseResultReviewRecord(
    value: unknown,
    index: number,
  ): HodResultReviewRecord | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as UnknownRecord;
    const courseRecord =
      (typeof record['course'] === 'object' && record['course'] !== null
        ? (record['course'] as UnknownRecord)
        : null) ?? null;

    const courseId =
      this.readNumber(record, 'course_id') ??
      this.readNumber(record, 'courseId') ??
      this.readNumber(courseRecord, 'id') ??
      null;

    const courseTitle =
      this.readString(record, 'course_title') ??
      this.readString(record, 'courseTitle') ??
      this.readString(courseRecord, 'title') ??
      this.readString(courseRecord, 'name') ??
      `Course ${index + 1}`;

    const courseCode =
      this.readString(record, 'course_code') ??
      this.readString(record, 'courseCode') ??
      this.readString(courseRecord, 'code') ??
      '-';

    const submittedBy =
      this.readString(record, 'submitted_by') ??
      this.readString(record, 'submittedBy') ??
      this.readString(record, 'lecturer_name') ??
      this.readString(record, 'lecturerName') ??
      this.readString(record, 'staff_name') ??
      this.readString(record, 'staffName') ??
      '-';

    const submittedAtRaw =
      this.readString(record, 'submitted_at') ??
      this.readString(record, 'submittedAt') ??
      this.readString(record, 'created_at') ??
      this.readString(record, 'createdAt') ??
      null;

    const programmeType =
      this.readString(record, 'programme_type') ??
      this.readString(record, 'programmeType') ??
      this.readString(record, 'program_type') ??
      this.readString(record, 'programType') ??
      this.readString(record, 'programme') ??
      this.readString(record, 'program') ??
      '-';

    const levelLabel =
      this.readString(record, 'level_label') ??
      this.readString(record, 'levelLabel') ??
      this.readString(record, 'level') ??
      '-';

    const approved =
      this.readBoolean(record, 'approved') ??
      this.readBoolean(record, 'is_approved') ??
      this.readBoolean(record, 'isApproved') ??
      false;
    const departmentId = this.readEntityId(record, 'department');
    const levelId = this.readEntityId(record, 'level');
    const semesterId = this.readEntityId(record, 'semester');

    const totalStudents =
      this.readNumber(record, 'total_students') ??
      this.readNumber(record, 'totalStudents') ??
      this.readNumber(record, 'students_total') ??
      0;

    const passedStudents =
      this.readNumber(record, 'passed_students') ??
      this.readNumber(record, 'passedStudents') ??
      this.readNumber(record, 'passes') ??
      0;

    const failedStudents =
      this.readNumber(record, 'failed_students') ??
      this.readNumber(record, 'failedStudents') ??
      this.readNumber(record, 'fails') ??
      Math.max(totalStudents - passedStudents, 0);

    const idValue =
      courseId !== null ? String(courseId) : `course-${index + 1}`;

    return {
      id: idValue,
      courseTitle,
      courseCode,
      submittedBy,
      programmeType,
      levelLabel,
      submittedAt: this.formatTimestamp(submittedAtRaw) ?? '-',
      totalStudents,
      passedStudents,
      failedStudents,
      approved,
      departmentId,
      levelId,
      semesterId,
      studentRows: [],
    };
  }

  private mapStudentRow(
    value: unknown,
    index: number,
  ): HodResultStudentRow | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as UnknownRecord;
    const studentRecord =
      (typeof record['student'] === 'object' && record['student'] !== null
        ? (record['student'] as UnknownRecord)
        : null) ?? null;

    const studentName =
      this.readString(record, 'student_name') ??
      this.readString(record, 'studentName') ??
      this.readString(studentRecord, 'name') ??
      this.readString(studentRecord, 'full_name') ??
      this.readString(record, 'name') ??
      `Student ${index + 1}`;

    const matricNo =
      this.readString(record, 'matric_no') ??
      this.readString(record, 'matricNo') ??
      this.readString(studentRecord, 'matric_no') ??
      this.readString(studentRecord, 'matriculation_no') ??
      '-';

    const continuousAssessmentScore =
      this.readNumber(record, 'test_score') ??
      this.readNumber(record, 'ca_score') ??
      this.readNumber(record, 'continuousAssessmentScore') ??
      0;

    const examScore =
      this.readNumber(record, 'exam_score') ??
      this.readNumber(record, 'examScore') ??
      0;

    const totalScore =
      this.readNumber(record, 'total_score') ??
      this.readNumber(record, 'totalScore') ??
      continuousAssessmentScore + examScore;

    const grade =
      this.readString(record, 'grade') ??
      this.readString(record, 'Grade') ??
      '-';

    const studentId =
      this.readNumber(record, 'student_id') ??
      this.readNumber(record, 'studentId') ??
      this.readNumber(studentRecord, 'id') ??
      null;

    const idValue =
      this.readString(record, 'id') ??
      (studentId !== null ? String(studentId) : null) ??
      this.readString(studentRecord, 'id') ??
      `student-${index + 1}`;

    return {
      id: idValue,
      studentName,
      matricNo,
      continuousAssessmentScore,
      examScore,
      totalScore,
      grade,
    };
  }

  private extractResponseData(response: unknown): unknown | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const candidate = response as UnknownRecord;
    if ('data' in candidate) {
      return candidate['data'];
    }

    return null;
  }

  private extractArrayCandidate(value: unknown): unknown[] | null {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as UnknownRecord;
    const possibleKeys = [
      'results',
      'courses',
      'course_results',
      'studentRows',
    ];

    for (const key of possibleKeys) {
      const nested = record[key];
      if (Array.isArray(nested)) {
        return nested;
      }
    }

    return null;
  }

  private buildCourseResultsQueryParams(
    query?: HodCourseResultsQuery,
  ): HttpParams {
    let params = new HttpParams();

    if (query?.department) {
      params = params.set('department', query.department);
    }
    if (query?.level) {
      params = params.set('level', query.level);
    }
    if (query?.semester) {
      params = params.set('semester', query.semester);
    }

    return params;
  }

  private readString(record: UnknownRecord | null, key: string): string | null {
    if (!record) {
      return null;
    }

    const value = record[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private readNumber(record: UnknownRecord | null, key: string): number | null {
    if (!record) {
      return null;
    }

    const value = record[key];
    const numericValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;

    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private readBoolean(
    record: UnknownRecord | null,
    key: string,
  ): boolean | null {
    if (!record) {
      return null;
    }

    const value = record[key];
    return typeof value === 'boolean' ? value : null;
  }

  private readEntityId(record: UnknownRecord, key: string): string | null {
    const directId =
      this.readString(record, `${key}_id`) ??
      (this.readNumber(record, `${key}_id`) !== null
        ? String(this.readNumber(record, `${key}_id`))
        : null) ??
      this.readString(record, `${key}Id`) ??
      (this.readNumber(record, `${key}Id`) !== null
        ? String(this.readNumber(record, `${key}Id`))
        : null);

    if (directId) {
      return directId;
    }

    const nestedValue = record[key];
    if (
      !nestedValue ||
      typeof nestedValue !== 'object' ||
      Array.isArray(nestedValue)
    ) {
      return null;
    }

    const nestedRecord = nestedValue as UnknownRecord;
    return (
      this.readString(nestedRecord, 'id') ??
      (this.readNumber(nestedRecord, 'id') !== null
        ? String(this.readNumber(nestedRecord, 'id'))
        : null)
    );
  }

  private formatTimestamp(rawTimestamp: string | null): string | null {
    if (!rawTimestamp) {
      return null;
    }

    const timestamp = new Date(rawTimestamp);
    if (Number.isNaN(timestamp.getTime())) {
      return rawTimestamp;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(timestamp);
  }
}

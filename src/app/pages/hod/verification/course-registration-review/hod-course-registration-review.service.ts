import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  HodCourseRegistrationRecord,
  HodRegisteredCourse,
} from '../../hod.types';
import {
  HodCourseRegistrationApprovePayload,
  HodCourseRegistrationDetailQuery,
  HodCourseRegistrationQuery,
} from './hod-course-registration-review-api.types';

type UnknownRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class HodCourseRegistrationReviewService {
  private readonly apiRoot = environment.apiURL;
  private readonly http = inject(HttpClient);

  getCourseRegistrations(
    query?: HodCourseRegistrationQuery,
  ): Observable<HodCourseRegistrationRecord[]> {
    const url = `${this.apiRoot}/api/v1/students/course-registrations`;
    const params = this.buildCourseRegistrationQueryParams(query);

    return this.http
      .get<unknown>(url, { params })
      .pipe(map((response) => this.mapCourseRegistrationsResponse(response)));
  }

  getCourseRegistrationDetail(
    query: HodCourseRegistrationDetailQuery,
  ): Observable<Partial<HodCourseRegistrationRecord> | null> {
    const url = `${this.apiRoot}/api/v1/students/course-registration-detail`;
    const params = new HttpParams()
      .set('student_id', String(query.student_id))
      .set('department_id', String(query.department_id))
      .set('level_id', String(query.level_id))
      .set('semester_id', String(query.semester_id));

    return this.http
      .get<unknown>(url, { params })
      .pipe(
        map((response) => this.mapCourseRegistrationDetailResponse(response)),
      );
  }

  approveCourseRegistration(
    payload: HodCourseRegistrationApprovePayload,
  ): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/students/course-registration/approve`;
    return this.http.post(url, payload);
  }

  private mapCourseRegistrationsResponse(
    response: unknown,
  ): HodCourseRegistrationRecord[] {
    const responseData = this.extractResponseData(response);
    const listCandidate =
      this.extractArrayCandidate(responseData) ??
      this.extractArrayCandidate(response) ??
      [];

    return listCandidate
      .map((entry, index) => this.mapCourseRegistrationRecord(entry, index))
      .filter(
        (record): record is HodCourseRegistrationRecord => record !== null,
      );
  }

  private mapCourseRegistrationDetailResponse(
    response: unknown,
  ): Partial<HodCourseRegistrationRecord> | null {
    const responseData = this.extractResponseData(response);
    const detailRecord =
      this.asRecord(responseData) ?? this.asRecord(response) ?? null;

    if (detailRecord === null) {
      return null;
    }

    const sourceRecord =
      this.asRecord(detailRecord['course_registration']) ??
      this.asRecord(detailRecord['registration']) ??
      detailRecord;
    const studentRecord =
      this.asRecord(detailRecord['student']) ??
      this.asRecord(sourceRecord['student']) ??
      null;
    const levelLabel = this.resolveLevelLabel(sourceRecord, studentRecord);
    const registeredCourses = this.resolveRegisteredCourses(
      detailRecord,
      sourceRecord,
    );
    const totalUnitsFromCourses = registeredCourses.reduce(
      (sum, course) => sum + course.units,
      0,
    );

    return {
      studentName:
        this.readString(studentRecord, 'name') ??
        this.readString(studentRecord, 'full_name') ??
        this.readString(sourceRecord, 'student_name') ??
        this.readString(sourceRecord, 'name') ??
        undefined,
      registrationNumber:
        this.readString(studentRecord, 'matriculation_number') ??
        this.readString(studentRecord, 'matriculation_no') ??
        this.readString(studentRecord, 'matric_no') ??
        this.readString(sourceRecord, 'registration_number') ??
        this.readString(sourceRecord, 'application_no') ??
        undefined,
      programmeType: this.resolveProgrammeType(levelLabel),
      levelLabel,
      courseCount:
        this.readNumber(sourceRecord, 'course_count') ??
        this.readNumber(sourceRecord, 'total_courses') ??
        this.readNumber(sourceRecord, 'registered_courses_count') ??
        registeredCourses.length,
      totalUnits:
        this.readNumber(sourceRecord, 'total_units') ??
        this.readNumber(sourceRecord, 'credit_load') ??
        totalUnitsFromCourses,
      coreCourseCount:
        this.readNumber(sourceRecord, 'core_course_count') ??
        registeredCourses.filter((course) => course.units > 0).length,
      status: this.resolveStatus(sourceRecord),
      submittedAt:
        this.formatTimestamp(
          this.readString(sourceRecord, 'submitted_at') ??
            this.readString(sourceRecord, 'created_at') ??
            this.readString(sourceRecord, 'updated_at') ??
            null,
        ) ?? '-',
      registeredCourses,
      detailsLoaded: true,
    };
  }

  private mapCourseRegistrationRecord(
    value: unknown,
    index: number,
  ): HodCourseRegistrationRecord | null {
    const record = this.asRecord(value);

    if (record === null) {
      return null;
    }

    const studentRecord = this.asRecord(record['student']);
    const levelLabel = this.resolveLevelLabel(record, studentRecord);
    const registeredCourses = this.resolveRegisteredCourses(
      record,
      studentRecord,
    );
    const totalUnitsFromCourses = registeredCourses.reduce(
      (sum, course) => sum + course.units,
      0,
    );
    const courseCount =
      this.readNumber(record, 'course_count') ??
      this.readNumber(record, 'registered_courses_count') ??
      this.readNumber(record, 'total_courses') ??
      registeredCourses.length;

    return {
      id:
        this.readString(record, 'id') ??
        (this.readNumber(record, 'id') !== null
          ? String(this.readNumber(record, 'id'))
          : null) ??
        (this.readNumber(studentRecord, 'id') !== null
          ? `course-registration-${String(this.readNumber(studentRecord, 'id'))}`
          : null) ??
        `course-registration-${index + 1}`,
      studentId:
        this.readNumber(record, 'student_id') ??
        this.readNumber(studentRecord, 'id') ??
        null,
      departmentId:
        this.readEntityId(record, 'department') ??
        this.readEntityId(studentRecord, 'department'),
      levelId:
        this.readEntityId(record, 'level') ??
        this.readEntityId(studentRecord, 'level'),
      semesterId: this.readEntityId(record, 'semester'),
      studentName:
        this.readString(studentRecord, 'name') ??
        this.readString(studentRecord, 'full_name') ??
        this.readString(record, 'student_name') ??
        this.readString(record, 'name') ??
        `Student ${index + 1}`,
      registrationNumber:
        this.readString(studentRecord, 'matriculation_number') ??
        this.readString(studentRecord, 'matriculation_no') ??
        this.readString(studentRecord, 'matric_no') ??
        this.readString(record, 'registration_number') ??
        this.readString(record, 'application_no') ??
        '-',
      programmeType: this.resolveProgrammeType(levelLabel),
      levelLabel,
      courseCount,
      totalUnits:
        this.readNumber(record, 'total_units') ??
        this.readNumber(record, 'credit_load') ??
        totalUnitsFromCourses,
      coreCourseCount:
        this.readNumber(record, 'core_course_count') ??
        this.readNumber(record, 'required_courses_count') ??
        this.countCoreCourses(record, registeredCourses),
      status: this.resolveStatus(record),
      submittedAt:
        this.formatTimestamp(
          this.readString(record, 'submitted_at') ??
            this.readString(record, 'created_at') ??
            this.readString(record, 'updated_at') ??
            null,
        ) ?? '-',
      registeredCourses,
      detailsLoaded: registeredCourses.length > 0,
    };
  }

  private buildCourseRegistrationQueryParams(
    query?: HodCourseRegistrationQuery,
  ): HttpParams {
    let params = new HttpParams();

    if (query?.department) {
      params = params.set('department', query.department);
    }
    if (query?.level) {
      params = params.set('level', query.level);
    }
    if (query?.program) {
      params = params.set('program', query.program);
    }
    if (query?.semester) {
      params = params.set('semester', query.semester);
    }

    return params;
  }

  private resolveRegisteredCourses(
    record: UnknownRecord,
    sourceRecord: UnknownRecord | null,
  ): HodRegisteredCourse[] {
    const courseCandidates =
      this.extractArrayCandidate(record, [
        'courses',
        'registered_courses',
        'registeredCourses',
        'course_registrations',
        'course_registration_courses',
      ]) ??
      this.extractArrayCandidate(sourceRecord, [
        'courses',
        'registered_courses',
        'registeredCourses',
      ]) ??
      [];

    return courseCandidates
      .map((course, index) => this.mapRegisteredCourse(course, index))
      .filter((entry): entry is HodRegisteredCourse => entry !== null);
  }

  private mapRegisteredCourse(
    value: unknown,
    index: number,
  ): HodRegisteredCourse | null {
    const record = this.asRecord(value);

    if (record === null) {
      return null;
    }

    const courseRecord = this.asRecord(record['course']) ?? record;

    return {
      code:
        this.readString(courseRecord, 'code') ??
        this.readString(record, 'course_code') ??
        `COURSE-${index + 1}`,
      title:
        this.readString(courseRecord, 'title') ??
        this.readString(courseRecord, 'name') ??
        this.readString(record, 'course_title') ??
        `Course ${index + 1}`,
      units:
        this.readNumber(courseRecord, 'units') ??
        this.readNumber(record, 'units') ??
        this.readNumber(record, 'credit_unit') ??
        0,
    };
  }

  private resolveLevelLabel(
    record: UnknownRecord,
    studentRecord: UnknownRecord | null,
  ): string {
    const rawLevelValue =
      this.readString(record, 'level_label') ??
      this.readNestedName(record['level']) ??
      this.readString(studentRecord, 'level_label') ??
      this.readNestedName(studentRecord?.['level']) ??
      this.readString(record, 'current_level') ??
      this.readString(studentRecord, 'current_level') ??
      this.readString(record, 'level') ??
      null;

    if (rawLevelValue === null) {
      return 'Assigned Level';
    }

    const normalizedLevelValue = rawLevelValue.trim().toUpperCase();

    if (normalizedLevelValue.includes('100')) {
      return 'OND 1';
    }
    if (normalizedLevelValue.includes('200')) {
      return 'OND 2';
    }
    if (normalizedLevelValue.includes('300')) {
      return 'HND 1';
    }
    if (normalizedLevelValue.includes('400')) {
      return 'HND 2';
    }

    return normalizedLevelValue;
  }

  private resolveProgrammeType(levelLabel: string): string {
    if (levelLabel.startsWith('OND')) {
      return 'OND';
    }

    if (levelLabel.startsWith('HND')) {
      return 'HND';
    }

    return '-';
  }

  private resolveStatus(
    record: UnknownRecord,
  ): HodCourseRegistrationRecord['status'] {
    const rawStatus =
      this.readString(record, 'status') ??
      this.readString(record, 'approval_status') ??
      this.readString(record, 'registration_status') ??
      this.readString(record, 'review_status') ??
      null;

    const normalizedStatus = rawStatus?.trim().toLowerCase() ?? null;

    if (normalizedStatus === 'approved') {
      return 'approved';
    }
    if (normalizedStatus === 'rejected' || normalizedStatus === 'declined') {
      return 'rejected';
    }
    if (normalizedStatus === 'resubmitted') {
      return 'resubmitted';
    }

    const isApproved =
      this.readBoolean(record, 'approved') ??
      this.readBoolean(record, 'is_approved') ??
      this.readBoolean(record, 'isApproved') ??
      false;

    return isApproved ? 'approved' : 'pending_review';
  }

  private extractResponseData(response: unknown): unknown | null {
    const record = this.asRecord(response);
    return record?.['data'] ?? null;
  }

  private extractArrayCandidate(
    value: unknown,
    keys = [
      'results',
      'items',
      'registrations',
      'course_registrations',
      'data',
    ],
  ): unknown[] | null {
    if (Array.isArray(value)) {
      return value;
    }

    const record = this.asRecord(value);

    if (record === null) {
      return null;
    }

    for (const key of keys) {
      const nestedValue = record[key];

      if (Array.isArray(nestedValue)) {
        return nestedValue;
      }
    }

    return null;
  }

  private countCoreCourses(
    record: UnknownRecord,
    registeredCourses: HodRegisteredCourse[],
  ): number {
    const courseCandidates =
      this.extractArrayCandidate(record, [
        'courses',
        'registered_courses',
        'registeredCourses',
        'course_registrations',
        'course_registration_courses',
      ]) ?? [];

    if (courseCandidates.length === 0) {
      return registeredCourses.length;
    }

    return courseCandidates.filter((course) => {
      const courseRecord = this.asRecord(course);

      return (
        this.readBoolean(courseRecord, 'is_core') ??
        this.readBoolean(courseRecord, 'is_compulsory') ??
        this.readString(courseRecord, 'course_type')?.toLowerCase() === 'core'
      );
    }).length;
  }

  private readEntityId(
    record: UnknownRecord | null,
    key: string,
  ): number | null {
    if (record === null) {
      return null;
    }

    const directId =
      this.readNumber(record, `${key}_id`) ??
      this.readNumber(record, `${key}Id`) ??
      null;

    if (directId !== null) {
      return directId;
    }

    const nestedRecord = this.asRecord(record[key]);
    return this.readNumber(nestedRecord, 'id');
  }

  private readNestedName(value: unknown): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    const record = this.asRecord(value);
    return this.readString(record, 'name');
  }

  private formatTimestamp(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  }

  private readString(record: UnknownRecord | null, key: string): string | null {
    if (record === null) {
      return null;
    }

    const value = record[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private readNumber(record: UnknownRecord | null, key: string): number | null {
    if (record === null) {
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
    if (record === null) {
      return null;
    }

    const value = record[key];
    return typeof value === 'boolean' ? value : null;
  }

  private asRecord(value: unknown): UnknownRecord | null {
    return value !== null && typeof value === 'object'
      ? (value as UnknownRecord)
      : null;
  }
}

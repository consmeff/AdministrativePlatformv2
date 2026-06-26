import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { resolveLecturerGrade } from './lecturer.constants';
import {
  LecturerCourseSingleResponse,
  LecturerResultsUploadResponse,
  LecturerStudentResultUpdatePayload,
} from './lecturer-results-api.types';
import { LecturerStudentResult } from './lecturer.types';

type UnknownRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class LecturerResultsService {
  private readonly apiRoot = environment.apiURL;
  private readonly http = inject(HttpClient);

  uploadResultsFile(
    courseId: number,
    file: File,
  ): Observable<HttpEvent<LecturerResultsUploadResponse>> {
    const url = `${this.apiRoot}/api/v1/students/results/upload`;
    const body = new FormData();

    body.append('file', file);
    body.append('course_id', String(courseId));

    return this.http.post<LecturerResultsUploadResponse>(url, body, {
      observe: 'events',
      reportProgress: true,
    });
  }

  updateStudentResults(
    payload: LecturerStudentResultUpdatePayload,
  ): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/students/results/update`;
    return this.http.post(url, payload);
  }

  getSingleCourseResults(
    courseId: number,
  ): Observable<LecturerStudentResult[]> {
    const url = `${this.apiRoot}/api/v1/staffs/single-course`;
    const params = new HttpParams().set('course_id', String(courseId));

    return this.http
      .get<LecturerCourseSingleResponse | unknown>(url, { params })
      .pipe(map((response) => this.extractStudentResults(response)));
  }

  private extractStudentResults(response: unknown): LecturerStudentResult[] {
    const responseData = this.extractResponseData(response);
    const listCandidate = this.extractArrayCandidate(responseData ?? response);

    if (!listCandidate) {
      return [];
    }

    return listCandidate
      .map((entry, index) => this.mapStudentResult(entry, index))
      .filter((entry): entry is LecturerStudentResult => entry !== null);
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
      'students',
      'student_results',
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

  private mapStudentResult(
    value: unknown,
    index: number,
  ): LecturerStudentResult | null {
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
      null;
    const matricNo =
      this.readString(record, 'matric_no') ??
      this.readString(record, 'matricNo') ??
      this.readString(studentRecord, 'matric_no') ??
      this.readString(studentRecord, 'matriculation_no') ??
      null;

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
      resolveLecturerGrade(totalScore);

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
      studentId,
      studentName: studentName ?? `Student ${index + 1}`,
      matricNo: matricNo ?? '-',
      continuousAssessmentScore,
      examScore,
      totalScore,
      grade,
    };
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
}

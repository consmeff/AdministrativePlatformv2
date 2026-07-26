import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HodLecturer } from '../hod.types';
import { AssignCoursesRequestPayload } from './hod-lecturers-api.types';

type UnknownRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class HodLecturersService {
  private readonly apiRoot = environment.apiURL;
  private readonly http = inject(HttpClient);

  getLecturers(): Observable<HodLecturer[]> {
    const url = `${this.apiRoot}/api/v1/staffs/lecturers`;
    return this.http
      .get<unknown>(url)
      .pipe(map((response) => this.mapLecturersResponse(response)));
  }

  assignCourses(payload: AssignCoursesRequestPayload): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/staffs/assign-courses`;
    return this.http.post(url, payload);
  }

  private mapLecturersResponse(response: unknown): HodLecturer[] {
    const responseData = this.extractResponseData(response);
    const listCandidate =
      this.extractArrayCandidate(responseData) ??
      this.extractArrayCandidate(response) ??
      [];

    return listCandidate
      .map((entry, index) => this.mapLecturer(entry, index))
      .filter((lecturer): lecturer is HodLecturer => lecturer !== null);
  }

  private mapLecturer(value: unknown, index: number): HodLecturer | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as UnknownRecord;
    const firstName = this.readString(record, 'first_name');
    const lastName = this.readString(record, 'last_name');
    const fullName =
      this.readString(record, 'full_name') ??
      this.readString(record, 'fullName') ??
      [firstName, lastName]
        .filter((part): part is string => part !== null)
        .join(' ') ??
      `Lecturer ${index + 1}`;

    const staffId =
      this.readString(record, 'staff_id') ??
      this.readString(record, 'staffId') ??
      this.readString(record, 'staff_no') ??
      this.readString(record, 'staffNo') ??
      `staff-${index + 1}`;

    const emailAddress =
      this.readString(record, 'email') ??
      this.readString(record, 'email_address') ??
      this.readString(record, 'emailAddress') ??
      '-';

    const phoneNumber =
      this.readString(record, 'phone_number') ??
      this.readString(record, 'phoneNumber') ??
      this.readString(record, 'phone') ??
      '-';

    const assignedCourseIds = this.readArrayOfIds(
      record,
      'assigned_course_ids',
    );
    const idValue =
      this.readString(record, 'id') ??
      (this.readNumber(record, 'id') !== null
        ? String(this.readNumber(record, 'id'))
        : null) ??
      `lecturer-${index + 1}`;

    return {
      id: idValue,
      fullName,
      staffId,
      emailAddress,
      phoneNumber,
      assignedCourseIds,
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
    const possibleKeys = ['lecturers', 'staffs', 'users', 'records'];

    for (const key of possibleKeys) {
      const nested = record[key];
      if (Array.isArray(nested)) {
        return nested;
      }
    }

    return null;
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

  private readArrayOfIds(record: UnknownRecord, key: string): string[] {
    const rawValue = record[key];
    if (!Array.isArray(rawValue)) {
      return [];
    }

    return rawValue
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }
        if (typeof entry === 'number') {
          return String(entry);
        }
        if (entry && typeof entry === 'object') {
          const nested = entry as UnknownRecord;
          const idCandidate =
            this.readString(nested, 'id') ??
            (this.readNumber(nested, 'id') !== null
              ? String(this.readNumber(nested, 'id'))
              : null);
          return idCandidate ?? null;
        }
        return null;
      })
      .filter((id): id is string => id !== null && id.length > 0);
  }
}

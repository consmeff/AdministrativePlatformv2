import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  HodDocumentFlagIssuePayload,
  HodDocumentVerificationStatusPayload,
} from './hod-document-verification-api.types';
import {
  HodDocumentFlag,
  HodDocumentVerificationRecord,
  HodVerificationDocument,
} from '../../hod.types';

type UnknownRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class HodDocumentVerificationService {
  private readonly http = inject(HttpClient);
  private readonly apiRoot = environment.apiURL;

  getDocumentVerifications(): Observable<HodDocumentVerificationRecord[]> {
    const url = `${this.apiRoot}/api/v1/students/documents`;

    return this.http
      .get<unknown>(url)
      .pipe(
        map((response) => this.extractDocumentVerificationRecords(response)),
      );
  }

  flagDocumentIssue(payload: HodDocumentFlagIssuePayload): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/students/documents/flag-issue`;
    return this.http.post(url, payload);
  }

  updateAdmissionDocumentStatus(
    payload: HodDocumentVerificationStatusPayload,
  ): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/students/admission-document-status`;
    return this.http.post(url, payload);
  }

  private extractDocumentVerificationRecords(
    response: unknown,
  ): HodDocumentVerificationRecord[] {
    const rootRecord = this.asRecord(response);
    const dataCandidate = rootRecord?.['data'] ?? response;
    const listCandidate = this.extractArrayCandidate(dataCandidate);

    if (listCandidate === null) {
      return [];
    }

    return listCandidate
      .map((entry, index) => this.mapDocumentVerificationRecord(entry, index))
      .filter(
        (entry): entry is HodDocumentVerificationRecord => entry !== null,
      );
  }

  private extractArrayCandidate(value: unknown): unknown[] | null {
    if (Array.isArray(value)) {
      return value;
    }

    const record = this.asRecord(value);

    if (record === null) {
      return null;
    }

    const keys = ['results', 'items', 'students', 'data'];

    for (const key of keys) {
      const nestedValue = record[key];

      if (Array.isArray(nestedValue)) {
        return nestedValue;
      }
    }

    return null;
  }

  private mapDocumentVerificationRecord(
    value: unknown,
    index: number,
  ): HodDocumentVerificationRecord | null {
    const rawRecord = this.asRecord(value);
    const record = rawRecord;

    if (record === null) {
      return null;
    }

    const studentRecord = this.asRecord(record['student']);
    const sourceRecord = studentRecord ?? record;
    const studentId =
      this.readNumber(sourceRecord, 'student_id') ??
      this.readNumber(sourceRecord, 'id') ??
      this.readNumber(record, 'student_id') ??
      this.readNumber(record, 'id') ??
      null;
    const levelLabel = this.resolveLevelLabel(record, sourceRecord);
    const complianceDirective =
      this.readString(record, 'compliance_directive') ??
      this.readString(sourceRecord, 'compliance_directive') ??
      null;
    const documents = this.resolveDocuments(record, sourceRecord, index);
    const submittedAtValue =
      this.readString(record, 'submitted_at') ??
      this.readString(sourceRecord, 'submitted_at') ??
      this.readString(record, 'created_at') ??
      this.readString(sourceRecord, 'created_at') ??
      this.readString(record, 'updated_at') ??
      this.readString(sourceRecord, 'updated_at') ??
      null;

    return {
      id:
        this.readString(record, 'id') ??
        (studentId !== null ? String(studentId) : null) ??
        `hod-document-verification-${index + 1}`,
      studentId,
      studentName:
        this.readString(sourceRecord, 'name') ??
        this.readString(sourceRecord, 'full_name') ??
        this.readString(sourceRecord, 'student_name') ??
        this.readString(record, 'name') ??
        this.readString(record, 'full_name') ??
        this.readString(record, 'student_name') ??
        `Student ${index + 1}`,
      registrationNumber:
        this.readString(sourceRecord, 'matriculation_no') ??
        this.readString(sourceRecord, 'matric_no') ??
        this.readString(sourceRecord, 'application_no') ??
        this.readString(sourceRecord, 'registration_number') ??
        this.readString(record, 'matriculation_no') ??
        this.readString(record, 'matric_no') ??
        this.readString(record, 'application_no') ??
        this.readString(record, 'registration_number') ??
        '-',
      programmeType: levelLabel.startsWith('OND') ? 'OND' : 'HND',
      levelLabel,
      submittedAt: this.formatTimestamp(submittedAtValue),
      status: this.resolveStatus(record, sourceRecord, complianceDirective),
      documents,
      flag:
        complianceDirective === null
          ? null
          : this.buildFlagData(
              complianceDirective,
              submittedAtValue,
              documents,
            ),
    };
  }

  private resolveDocuments(
    record: UnknownRecord,
    sourceRecord: UnknownRecord,
    index: number,
  ): HodVerificationDocument[] {
    const documentCandidates =
      (Array.isArray(record['documents']) ? record['documents'] : null) ??
      (Array.isArray(sourceRecord['documents'])
        ? sourceRecord['documents']
        : null) ??
      [];

    return documentCandidates.map((document, documentIndex) =>
      this.mapDocument(document, index, documentIndex),
    );
  }

  private mapDocument(
    value: unknown,
    recordIndex: number,
    documentIndex: number,
  ): HodVerificationDocument {
    const record = this.asRecord(value);
    const previewUrl =
      this.readString(record, 'preview_url') ??
      this.readString(record, 'url') ??
      this.readString(record, 'file') ??
      this.readString(record, 'document') ??
      '';
    const rawFileSize = record?.['file_size'] ?? record?.['size'] ?? null;

    return {
      id:
        (record?.['id'] !== undefined && record?.['id'] !== null
          ? String(record['id'])
          : null) ?? `hod-document-${recordIndex + 1}-${documentIndex + 1}`,
      name:
        this.readString(record, 'name') ??
        this.readString(record, 'title') ??
        this.readString(record, 'document_name') ??
        this.readString(record, 'file_name') ??
        `Document ${documentIndex + 1}`,
      fileSizeLabel: this.formatFileSize(rawFileSize),
      previewUrl,
    };
  }

  private resolveLevelLabel(
    record: UnknownRecord,
    sourceRecord: UnknownRecord,
  ): string {
    const levelValue =
      this.readString(sourceRecord, 'level_label') ??
      this.readNestedName(sourceRecord['level']) ??
      this.readString(sourceRecord, 'current_level') ??
      this.readString(record, 'level_label') ??
      this.readNestedName(record['level']) ??
      this.readString(record, 'current_level') ??
      null;

    if (levelValue === null) {
      return 'Assigned Level';
    }

    const normalizedLevelValue = levelValue.trim().toUpperCase();

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

  private resolveStatus(
    record: UnknownRecord,
    sourceRecord: UnknownRecord,
    complianceDirective: string | null,
  ): HodDocumentVerificationRecord['status'] {
    const isVerified =
      this.readBoolean(record, 'is_verified') ??
      this.readBoolean(sourceRecord, 'is_verified') ??
      false;

    if (isVerified) {
      return 'verified';
    }

    if (complianceDirective !== null) {
      return 'flagged';
    }

    return 'pending';
  }

  private buildFlagData(
    complianceDirective: string,
    flaggedAt: string | null,
    documents: HodVerificationDocument[],
  ): HodDocumentFlag {
    return {
      affectedDocuments: documents.map((document) => document.name),
      reason: complianceDirective,
      note: complianceDirective,
      flaggedAt: this.formatTimestamp(flaggedAt),
    };
  }

  private formatFileSize(value: unknown): string {
    const numericValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return '-';
    }

    if (numericValue < 1024) {
      return `${numericValue} B`;
    }
    if (numericValue < 1024 * 1024) {
      return `${Math.round(numericValue / 1024)} KB`;
    }

    return `${(numericValue / (1024 * 1024)).toFixed(1)} MB`;
  }

  private formatTimestamp(value: string | null): string {
    if (value === null) {
      return '-';
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

  private readNestedName(value: unknown): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    const record = this.asRecord(value);
    return this.readString(record, 'name');
  }

  private asRecord(value: unknown): UnknownRecord | null {
    return value !== null && typeof value === 'object'
      ? (value as UnknownRecord)
      : null;
  }
}

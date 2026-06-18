import { Injectable, computed, signal } from '@angular/core';
import {
  HOD_COURSE_REGISTRATION_RECORDS,
  HOD_DOCUMENT_VERIFICATION_RECORDS,
  HOD_PROFILE,
  HOD_RESULT_REVIEW_RECORDS,
  HOD_STUDENT_RECORDS,
} from './hod.constants';
import {
  HodCourseRegistrationRecord,
  HodDocumentVerificationRecord,
  HodDocumentFlag,
  HodProfile,
  HodResultReviewRecord,
  HodStudentRecord,
} from './hod.types';

interface HodState {
  courseRegistrations: HodCourseRegistrationRecord[];
  documentVerifications: HodDocumentVerificationRecord[];
  resultReviews: HodResultReviewRecord[];
  studentRecords: HodStudentRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class HodStateService {
  private readonly state = signal<HodState>({
    courseRegistrations: HOD_COURSE_REGISTRATION_RECORDS,
    documentVerifications: HOD_DOCUMENT_VERIFICATION_RECORDS,
    resultReviews: HOD_RESULT_REVIEW_RECORDS,
    studentRecords: HOD_STUDENT_RECORDS,
  });

  readonly profile = signal<HodProfile>(HOD_PROFILE);
  readonly courseRegistrations = computed(
    () => this.state().courseRegistrations,
  );
  readonly documentVerifications = computed(
    () => this.state().documentVerifications,
  );
  readonly resultReviews = computed(() => this.state().resultReviews);
  readonly studentRecords = computed(() => this.state().studentRecords);
  readonly pendingCourseRegistrationCount = computed(
    () =>
      this.courseRegistrations().filter(
        (record) =>
          record.status === 'pending_review' || record.status === 'resubmitted',
      ).length,
  );
  readonly rejectedCourseRegistrationCount = computed(
    () =>
      this.courseRegistrations().filter(
        (record) => record.status === 'rejected',
      ).length,
  );
  readonly pendingDocumentVerificationCount = computed(
    () =>
      this.documentVerifications().filter(
        (record) => record.status === 'pending',
      ).length,
  );
  readonly flaggedDocumentCount = computed(
    () =>
      this.documentVerifications().filter(
        (record) => record.status === 'flagged',
      ).length,
  );
  readonly pendingResultReviewCount = computed(
    () => this.resultReviews().filter((record) => !record.approved).length,
  );
  readonly approvedResultReviewCount = computed(
    () => this.resultReviews().filter((record) => record.approved).length,
  );

  getCourseRegistrationById(
    recordId: string,
  ): HodCourseRegistrationRecord | null {
    return (
      this.courseRegistrations().find((record) => record.id === recordId) ??
      null
    );
  }

  approveCourseRegistration(recordId: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      courseRegistrations: currentState.courseRegistrations.map((record) =>
        record.id === recordId ? { ...record, status: 'approved' } : record,
      ),
    }));
  }

  rejectCourseRegistration(recordId: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      courseRegistrations: currentState.courseRegistrations.map((record) =>
        record.id === recordId ? { ...record, status: 'rejected' } : record,
      ),
    }));
  }

  verifyDocuments(recordId: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      documentVerifications: currentState.documentVerifications.map((record) =>
        record.id === recordId
          ? { ...record, status: 'verified', flag: null }
          : record,
      ),
    }));
  }

  flagDocuments(
    recordId: string,
    flagPayload: Omit<HodDocumentFlag, 'flaggedAt'>,
  ): void {
    this.state.update((currentState) => ({
      ...currentState,
      documentVerifications: currentState.documentVerifications.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: 'flagged',
              flag: {
                ...flagPayload,
                flaggedAt: this.formatTimestamp(),
              },
            }
          : record,
      ),
    }));
  }

  approveResultReview(recordId: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      resultReviews: currentState.resultReviews.map((record) =>
        record.id === recordId ? { ...record, approved: true } : record,
      ),
    }));
  }

  getStudentRecordById(recordId: string): HodStudentRecord | null {
    return (
      this.studentRecords().find((record) => record.id === recordId) ?? null
    );
  }

  private formatTimestamp(): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }
}

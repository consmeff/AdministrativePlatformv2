import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { NotificationService } from '../../services/notification.service';
import {
  HOD_COURSE_CATALOGUE_COURSES,
  HOD_COURSE_LEVEL_CONFIGURATIONS,
  HOD_COURSE_OVERVIEW_LEVELS,
  HOD_COURSE_PUBLICATION_HISTORY,
  HOD_COURSE_REGISTRATION_RECORDS,
  HOD_LECTURERS,
  HOD_LECTURER_ASSIGNMENT_HISTORY,
  HOD_LECTURER_COURSES,
  HOD_PROFILE,
  HOD_RESULT_REVIEW_RECORDS,
  HOD_STUDENT_RECORDS,
} from './hod.constants';
import {
  HodCourseCatalogueCourse,
  HodCourseLevelConfiguration,
  HodCourseLevelSelection,
  HodCourseOverviewLevel,
  HodCoursePublicationHistoryRecord,
  HodCourseRegistrationRecord,
  HodDocumentVerificationRecord,
  HodDocumentFlag,
  HodLecturer,
  HodLecturerAssignmentHistoryRecord,
  HodLecturerCourse,
  HodProfile,
  HodResultReviewRecord,
  HodStudentRecord,
} from './hod.types';
import { HodDocumentVerificationService } from './verification/document-verification/hod-document-verification.service';

interface HodState {
  courseRegistrations: HodCourseRegistrationRecord[];
  documentVerifications: HodDocumentVerificationRecord[];
  resultReviews: HodResultReviewRecord[];
  studentRecords: HodStudentRecord[];
  lecturers: HodLecturer[];
  lecturerCourses: HodLecturerCourse[];
  lecturerAssignmentHistory: HodLecturerAssignmentHistoryRecord[];
  courseOverviewLevels: HodCourseOverviewLevel[];
  courseCatalogueCourses: HodCourseCatalogueCourse[];
  courseLevelConfigurations: HodCourseLevelConfiguration[];
  coursePublicationHistory: HodCoursePublicationHistoryRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class HodStateService {
  private readonly hodDocumentVerificationService = inject(
    HodDocumentVerificationService,
  );
  private readonly busyIndicatorService = inject(BusyIndicatorService);
  private readonly notificationService = inject(NotificationService);
  private readonly state = signal<HodState>({
    courseRegistrations: HOD_COURSE_REGISTRATION_RECORDS,
    documentVerifications: [],
    resultReviews: HOD_RESULT_REVIEW_RECORDS,
    studentRecords: HOD_STUDENT_RECORDS,
    lecturers: HOD_LECTURERS,
    lecturerCourses: HOD_LECTURER_COURSES,
    lecturerAssignmentHistory: HOD_LECTURER_ASSIGNMENT_HISTORY,
    courseOverviewLevels: HOD_COURSE_OVERVIEW_LEVELS,
    courseCatalogueCourses: HOD_COURSE_CATALOGUE_COURSES,
    courseLevelConfigurations: HOD_COURSE_LEVEL_CONFIGURATIONS,
    coursePublicationHistory: HOD_COURSE_PUBLICATION_HISTORY,
  });
  readonly isDocumentVerificationsLoading = signal(false);

  constructor() {
    this.loadDocumentVerifications();
  }

  readonly profile = signal<HodProfile>(HOD_PROFILE);
  readonly courseRegistrations = computed(
    () => this.state().courseRegistrations,
  );
  readonly documentVerifications = computed(
    () => this.state().documentVerifications,
  );
  readonly resultReviews = computed(() => this.state().resultReviews);
  readonly studentRecords = computed(() => this.state().studentRecords);
  readonly lecturers = computed(() => this.state().lecturers);
  readonly lecturerCourses = computed(() => this.state().lecturerCourses);
  readonly lecturerAssignmentHistory = computed(
    () => this.state().lecturerAssignmentHistory,
  );
  readonly courseOverviewLevels = computed(
    () => this.state().courseOverviewLevels,
  );
  readonly courseCatalogueCourses = computed(
    () => this.state().courseCatalogueCourses,
  );
  readonly courseLevelConfigurations = computed(
    () => this.state().courseLevelConfigurations,
  );
  readonly coursePublicationHistory = computed(
    () => this.state().coursePublicationHistory,
  );
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
    const activeRecord =
      this.documentVerifications().find((record) => record.id === recordId) ??
      null;

    if (activeRecord?.studentId === null || activeRecord === null) {
      return;
    }

    this.busyIndicatorService.show();
    this.hodDocumentVerificationService
      .updateAdmissionDocumentStatus({
        student_id: activeRecord.studentId,
        is_verified: true,
      })
      .pipe(
        finalize(() => {
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: () => {
          this.state.update((currentState) => ({
            ...currentState,
            documentVerifications: currentState.documentVerifications.map(
              (record) =>
                record.id === recordId
                  ? { ...record, status: 'verified', flag: null }
                  : record,
            ),
          }));
          this.notificationService.success('Document marked as verified.');
        },
      });
  }

  flagDocuments(
    recordId: string,
    flagPayload: Omit<HodDocumentFlag, 'flaggedAt'>,
  ): void {
    const activeRecord =
      this.documentVerifications().find((record) => record.id === recordId) ??
      null;

    if (activeRecord?.studentId === null || activeRecord === null) {
      return;
    }

    this.busyIndicatorService.show();
    this.hodDocumentVerificationService
      .flagDocumentIssue({
        student_id: activeRecord.studentId,
        compliance_directive: this.buildComplianceDirective(flagPayload),
      })
      .pipe(
        finalize(() => {
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: () => {
          this.state.update((currentState) => ({
            ...currentState,
            documentVerifications: currentState.documentVerifications.map(
              (record) =>
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
          this.notificationService.success('Document flagged successfully.');
        },
      });
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

  getLecturerById(lecturerId: string): HodLecturer | null {
    return (
      this.lecturers().find((lecturer) => lecturer.id === lecturerId) ?? null
    );
  }

  getLecturerCourseById(courseId: string): HodLecturerCourse | null {
    return (
      this.lecturerCourses().find((course) => course.id === courseId) ?? null
    );
  }

  assignLecturerToCourse(courseId: string, lecturerId: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      lecturerCourses: currentState.lecturerCourses.map((course) =>
        course.id === courseId &&
        !course.assignedLecturerIds.includes(lecturerId)
          ? {
              ...course,
              assignedLecturerIds: [...course.assignedLecturerIds, lecturerId],
            }
          : course,
      ),
      lecturers: currentState.lecturers.map((lecturer) =>
        lecturer.id === lecturerId &&
        !lecturer.assignedCourseIds.includes(courseId)
          ? {
              ...lecturer,
              assignedCourseIds: [...lecturer.assignedCourseIds, courseId],
            }
          : lecturer,
      ),
    }));
  }

  removeLecturerFromCourse(courseId: string, lecturerId: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      lecturerCourses: currentState.lecturerCourses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              assignedLecturerIds: course.assignedLecturerIds.filter(
                (assignedLecturerId) => assignedLecturerId !== lecturerId,
              ),
            }
          : course,
      ),
      lecturers: currentState.lecturers.map((lecturer) =>
        lecturer.id === lecturerId
          ? {
              ...lecturer,
              assignedCourseIds: lecturer.assignedCourseIds.filter(
                (assignedCourseId) => assignedCourseId !== courseId,
              ),
            }
          : lecturer,
      ),
    }));
  }

  appendLecturerAssignmentHistory(
    records: Omit<HodLecturerAssignmentHistoryRecord, 'id' | 'changedAt'>[],
  ): void {
    if (records.length === 0) {
      return;
    }

    const changedAt = this.formatTimestamp();

    this.state.update((currentState) => ({
      ...currentState,
      lecturerAssignmentHistory: [
        ...records.map((record, index) => ({
          ...record,
          id: `hod-lecturer-history-${Date.now()}-${index + 1}`,
          changedAt,
        })),
        ...currentState.lecturerAssignmentHistory,
      ],
    }));
  }

  getCourseOverviewLevel(levelValue: string): HodCourseOverviewLevel | null {
    return (
      this.courseOverviewLevels().find(
        (level) => level.levelValue === levelValue,
      ) ?? null
    );
  }

  getCourseLevelConfiguration(
    levelValue: string,
  ): HodCourseLevelConfiguration | null {
    return (
      this.courseLevelConfigurations().find(
        (configuration) => configuration.levelValue === levelValue,
      ) ?? null
    );
  }

  publishCourseLevelSelection(
    levelValue: string,
    selections: HodCourseLevelSelection[],
  ): void {
    const levelConfiguration = this.getCourseLevelConfiguration(levelValue);
    const courseOverviewLevel = this.getCourseOverviewLevel(levelValue);

    if (!levelConfiguration || !courseOverviewLevel) {
      return;
    }

    const totalUnits = selections.reduce((sum, selection) => {
      const course = this.courseCatalogueCourses().find(
        (catalogueCourse) => catalogueCourse.id === selection.courseId,
      );

      return sum + (course?.units ?? 0);
    }, 0);
    const formattedTimestamp = this.formatTimestamp();

    this.state.update((currentState) => ({
      ...currentState,
      courseLevelConfigurations: currentState.courseLevelConfigurations.map(
        (configuration) =>
          configuration.levelValue === levelValue
            ? {
                ...configuration,
                selections: [...selections],
                publishedAt: formattedTimestamp,
              }
            : configuration,
      ),
      courseOverviewLevels: currentState.courseOverviewLevels.map((level) =>
        level.levelValue === levelValue
          ? {
              ...level,
              configured: true,
              semesters: level.semesters.map((semester) => ({
                ...semester,
                courseCount: selections.length,
                totalUnits,
              })),
            }
          : level,
      ),
      coursePublicationHistory: [
        {
          id: `hod-course-publication-history-${Date.now()}`,
          sessionLabel: '2024/2025',
          levelValue,
          levelLabel: courseOverviewLevel.levelLabel,
          courseCount: selections.length,
          totalUnits,
          lecturerCount: 0,
          publishedAt: formattedTimestamp,
        },
        ...currentState.coursePublicationHistory,
      ],
    }));
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

  private loadDocumentVerifications(): void {
    this.isDocumentVerificationsLoading.set(true);
    this.busyIndicatorService.show();

    this.hodDocumentVerificationService
      .getDocumentVerifications()
      .pipe(
        finalize(() => {
          this.isDocumentVerificationsLoading.set(false);
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: (documentVerifications) => {
          this.state.update((currentState) => ({
            ...currentState,
            documentVerifications,
          }));
        },
        error: () => {
          this.state.update((currentState) => ({
            ...currentState,
            documentVerifications: [],
          }));
        },
      });
  }

  private buildComplianceDirective(
    flagPayload: Omit<HodDocumentFlag, 'flaggedAt'>,
  ): string {
    const affectedDocumentsLabel =
      flagPayload.affectedDocuments.length > 0
        ? `Documents: ${flagPayload.affectedDocuments.join(', ')}`
        : null;
    const noteLabel =
      flagPayload.note.trim().length > 0
        ? `Note: ${flagPayload.note.trim()}`
        : null;

    return [flagPayload.reason, affectedDocumentsLabel, noteLabel]
      .filter((value): value is string => value !== null)
      .join(' | ');
  }
}

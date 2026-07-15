import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin, map, Observable, of, tap } from 'rxjs';
import { BusyIndicatorService } from '../../services/busy-indicator.service';
import { NotificationService } from '../../services/notification.service';
import {
  HOD_COURSE_CATALOGUE_COURSES,
  HOD_COURSE_LEVEL_CONFIGURATIONS,
  HOD_COURSE_OVERVIEW_LEVELS,
  HOD_COURSE_PUBLICATION_HISTORY,
  HOD_COURSE_REGISTRATION_RECORDS,
  HOD_LECTURER_ASSIGNMENT_HISTORY,
  HOD_LECTURER_COURSES,
  HOD_PROFILE,
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
  HodResultStudentRow,
  HodStudentRecord,
} from './hod.types';
import { HodDocumentVerificationService } from './verification/document-verification/hod-document-verification.service';
import { HodLecturersService } from './lecturers/hod-lecturers.service';
import { HodResultReviewService } from './result-review/hod-result-review.service';

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
  private readonly hodLecturersService = inject(HodLecturersService);
  private readonly hodResultReviewService = inject(HodResultReviewService);
  private readonly busyIndicatorService = inject(BusyIndicatorService);
  private readonly notificationService = inject(NotificationService);
  private readonly state = signal<HodState>({
    courseRegistrations: HOD_COURSE_REGISTRATION_RECORDS,
    documentVerifications: [],
    resultReviews: [],
    studentRecords: HOD_STUDENT_RECORDS,
    lecturers: [],
    lecturerCourses: HOD_LECTURER_COURSES,
    lecturerAssignmentHistory: HOD_LECTURER_ASSIGNMENT_HISTORY,
    courseOverviewLevels: HOD_COURSE_OVERVIEW_LEVELS,
    courseCatalogueCourses: HOD_COURSE_CATALOGUE_COURSES,
    courseLevelConfigurations: HOD_COURSE_LEVEL_CONFIGURATIONS,
    coursePublicationHistory: HOD_COURSE_PUBLICATION_HISTORY,
  });
  readonly isDocumentVerificationsLoading = signal(false);
  readonly isResultReviewsLoading = signal(false);
  readonly isLecturersLoading = signal(false);
  readonly loadingResultReviewIds = signal<string[]>([]);

  constructor() {
    this.loadDocumentVerifications();
    this.loadResultReviews();
    this.loadLecturers();
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
    const matchedRecord =
      this.resultReviews().find((record) => record.id === recordId) ?? null;
    if (
      matchedRecord === null ||
      matchedRecord.departmentId === null ||
      matchedRecord.departmentId === undefined ||
      matchedRecord.levelId === null ||
      matchedRecord.levelId === undefined ||
      matchedRecord.semesterId === null ||
      matchedRecord.semesterId === undefined
    ) {
      this.notificationService.warn(
        'This result is missing department, level, or semester information.',
      );
      return;
    }

    this.busyIndicatorService.show();
    this.hodResultReviewService
      .approveCourseResults({
        course_id: matchedRecord.id,
        department_id: matchedRecord.departmentId,
        level_id: matchedRecord.levelId,
        semester_id: matchedRecord.semesterId,
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
            resultReviews: currentState.resultReviews.map((record) =>
              record.id === recordId ? { ...record, approved: true } : record,
            ),
          }));
          this.notificationService.success('Results approved successfully.');
        },
      });
  }

  loadResultReviewStudentRows(recordId: string): void {
    const courseId = Number(recordId);
    if (!Number.isFinite(courseId)) {
      return;
    }

    if (this.loadingResultReviewIds().includes(recordId)) {
      return;
    }

    const matchedRecord =
      this.resultReviews().find((record) => record.id === recordId) ?? null;
    if (matchedRecord?.studentRows.length) {
      return;
    }

    this.loadingResultReviewIds.update((ids) => [...ids, recordId]);
    this.hodResultReviewService
      .getCourseResultsDetail(courseId)
      .pipe(
        finalize(() => {
          this.loadingResultReviewIds.update((ids) =>
            ids.filter((id) => id !== recordId),
          );
        }),
      )
      .subscribe({
        next: (studentRows: HodResultStudentRow[]) => {
          this.state.update((currentState) => ({
            ...currentState,
            resultReviews: currentState.resultReviews.map((record) =>
              record.id === recordId ? { ...record, studentRows } : record,
            ),
          }));
        },
        error: () => {
          this.state.update((currentState) => ({
            ...currentState,
            resultReviews: currentState.resultReviews.map((record) =>
              record.id === recordId ? { ...record, studentRows: [] } : record,
            ),
          }));
        },
      });
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

  saveLecturerCourseAssignments(
    records: Omit<HodLecturerAssignmentHistoryRecord, 'id' | 'changedAt'>[],
  ): Observable<void> {
    if (records.length === 0) {
      return of(void 0);
    }

    const assignmentPayloads = this.buildAssignCoursesRequestPayloads(records);

    if (assignmentPayloads.length === 0) {
      return of(void 0);
    }

    this.busyIndicatorService.show();

    return forkJoin(
      assignmentPayloads.map((payload) =>
        this.hodLecturersService.assignCourses(payload),
      ),
    ).pipe(
      tap(() => {
        this.appendLecturerAssignmentHistory(records);
        this.notificationService.success(
          'Course assignments updated successfully.',
        );
      }),
      map(() => void 0),
      finalize(() => {
        this.busyIndicatorService.hide();
      }),
    );
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

  private buildAssignCoursesRequestPayloads(
    records: Omit<HodLecturerAssignmentHistoryRecord, 'id' | 'changedAt'>[],
  ) {
    const changedCourseIds = Array.from(
      new Set(records.map((record) => record.courseId)),
    );

    return changedCourseIds
      .map((courseId) => {
        const matchedCourse = this.getLecturerCourseById(courseId);

        if (!matchedCourse) {
          return null;
        }

        return {
          course_id: matchedCourse.id,
          lecturer_ids: [...matchedCourse.assignedLecturerIds],
        };
      })
      .filter((payload) => payload !== null);
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

  private loadResultReviews(): void {
    this.isResultReviewsLoading.set(true);
    this.busyIndicatorService.show();

    this.hodResultReviewService
      .getCourseResults({
        department: this.profile().departmentLabel,
      })
      .pipe(
        finalize(() => {
          this.isResultReviewsLoading.set(false);
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: (resultReviews) => {
          this.state.update((currentState) => ({
            ...currentState,
            resultReviews,
          }));
        },
        error: () => {
          this.state.update((currentState) => ({
            ...currentState,
            resultReviews: [],
          }));
        },
      });
  }

  private loadLecturers(): void {
    this.isLecturersLoading.set(true);
    this.busyIndicatorService.show();

    this.hodLecturersService
      .getLecturers()
      .pipe(
        finalize(() => {
          this.isLecturersLoading.set(false);
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: (lecturers) => {
          this.state.update((currentState) => ({
            ...currentState,
            lecturers,
          }));
        },
        error: () => {
          this.state.update((currentState) => ({
            ...currentState,
            lecturers: [],
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

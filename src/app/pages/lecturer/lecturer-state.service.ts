import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  LECTURER_DEFAULT_RESULT_TEMPLATE_NAME,
  LECTURER_PROFILE,
  LECTURER_RESULT_TEMPLATE_HEADERS,
} from './lecturer.constants';
import { LecturerCourseAssignmentService } from './lecturer-course-assignment.service';
import { LecturerResultsService } from './lecturer-results.service';
import {
  LecturerCourse,
  LecturerProfile,
  LecturerStudentResult,
} from './lecturer.types';
import { BusyIndicatorService } from '../../services/busy-indicator.service';

interface LecturerCoursesState {
  courses: LecturerCourse[];
  hasLoaded: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LecturerStateService {
  private readonly lecturerCourseAssignmentService = inject(
    LecturerCourseAssignmentService,
  );
  private readonly lecturerResultsService = inject(LecturerResultsService);
  private readonly busyIndicatorService = inject(BusyIndicatorService);

  constructor() {
    this.loadAssignedCourses();
  }

  private readonly state = signal<LecturerCoursesState>({
    courses: [],
    hasLoaded: false,
    isLoading: false,
  });

  readonly lecturerProfile = signal<LecturerProfile>(LECTURER_PROFILE);
  readonly courses = computed(() => this.state().courses);
  readonly hasLoaded = computed(() => this.state().hasLoaded);
  readonly isLoading = computed(() => this.state().isLoading);

  getCourseById(courseId: string): LecturerCourse | null {
    return this.courses().find((course) => course.id === courseId) ?? null;
  }

  loadAssignedCourses(): void {
    this.state.update((currentState) => ({
      ...currentState,
      isLoading: true,
    }));
    this.busyIndicatorService.show();

    this.lecturerCourseAssignmentService
      .getAssignedCourses()
      .pipe(
        finalize(() => {
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: (payload) => {
          this.lecturerProfile.update((profile) => ({
            ...profile,
            fullName: payload.lecturerName ?? profile.fullName,
            emailAddress: payload.lecturerEmail ?? profile.emailAddress,
            roleLabel: payload.roleLabel ?? profile.roleLabel,
          }));

          this.state.update((currentState) => ({
            courses: this.mergeCourses(payload.courses, currentState.courses),
            hasLoaded: true,
            isLoading: false,
          }));
        },
        error: () => {
          this.state.update((currentState) => ({
            ...currentState,
            courses: [],
            hasLoaded: true,
            isLoading: false,
          }));
        },
      });
  }

  loadCourseResults(courseId: string): void {
    const numericCourseId = Number(courseId);

    if (!Number.isFinite(numericCourseId)) {
      return;
    }

    this.lecturerResultsService
      .getSingleCourseResults(numericCourseId)
      .subscribe({
        next: (students) => {
          this.state.update((currentState) => ({
            ...currentState,
            courses: currentState.courses.map((course) =>
              course.id === courseId ? { ...course, students } : course,
            ),
          }));
        },
      });
  }

  updateCourseUploadSummary(courseId: string, successMessage: string): void {
    this.state.update((currentState) => ({
      ...currentState,
      courses: currentState.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              uploadSummary: {
                lastUploadedAt: this.formatUploadTimestamp(),
                successMessage,
              },
            }
          : course,
      ),
    }));
  }

  updateCourseStudents(
    courseId: string,
    students: LecturerStudentResult[],
    successMessage: string,
  ): void {
    this.state.update((currentState) => ({
      ...currentState,
      courses: currentState.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              students,
              uploadSummary: {
                lastUploadedAt: this.formatUploadTimestamp(),
                successMessage,
              },
            }
          : course,
      ),
    }));
  }

  downloadTemplate(): void {
    const templateRows = [
      LECTURER_RESULT_TEMPLATE_HEADERS.join(','),
      'Gbadegesin Ishola Dada,CONSMMEFS/ENT-2025/001,20,50',
      'Amaka Obi,CONSMMEFS/ENT-2025/002,18,46',
    ];
    const blob = new Blob([templateRows.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const objectUrl = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = LECTURER_DEFAULT_RESULT_TEMPLATE_NAME;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    globalThis.URL.revokeObjectURL(objectUrl);
  }

  private formatUploadTimestamp(): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }

  private mergeCourses(
    apiCourses: LecturerCourse[],
    existingCourses: LecturerCourse[],
  ): LecturerCourse[] {
    const existingCourseByCode = new Map(
      existingCourses.map((course) => [course.code, course]),
    );

    return apiCourses.map((course) => {
      const existingCourse = existingCourseByCode.get(course.code) ?? null;

      return {
        ...course,
        students: existingCourse?.students ?? course.students,
        uploadSummary: existingCourse?.uploadSummary ?? course.uploadSummary,
      };
    });
  }
}

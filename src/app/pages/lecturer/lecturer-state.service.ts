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
import { AuthService } from '../../services/auth.service';
import { BusyIndicatorService } from '../../services/busy-indicator.service';

interface LecturerCoursesState {
  courses: LecturerCourse[];
  hasLoaded: boolean;
  isLoading: boolean;
}

type UnknownRecord = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class LecturerStateService {
  private readonly authService = inject(AuthService);
  private readonly lecturerCourseAssignmentService = inject(
    LecturerCourseAssignmentService,
  );
  private readonly lecturerResultsService = inject(LecturerResultsService);
  private readonly busyIndicatorService = inject(BusyIndicatorService);

  constructor() {
    this.applyStoredRoleLabel();
    this.loadCurrentUserProfile();
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
          this.lecturerProfile.update((profile) => {
            const nextProfile = {
              ...profile,
              fullName: payload.lecturerName ?? profile.fullName,
              emailAddress: payload.lecturerEmail ?? profile.emailAddress,
              roleLabel: payload.roleLabel ?? profile.roleLabel,
            };

            return nextProfile;
          });

          this.state.update((currentState) => ({
            courses: this.mergeCourses(payload.courses, currentState.courses),
            hasLoaded: true,
            isLoading: false,
          }));
          this.syncCourseDepartmentLabels(
            this.lecturerProfile().departmentLabel,
          );
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

  loadCurrentUserProfile(): void {
    this.authService.getCurrentUserProfile().subscribe((response) => {
      const profilePatch = this.mapCurrentUserProfile(response);

      this.lecturerProfile.update((profile) => {
        const nextProfile = {
          ...profile,
          ...profilePatch,
        };

        return nextProfile;
      });
      this.syncCourseDepartmentLabels(this.lecturerProfile().departmentLabel);
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

  private applyStoredRoleLabel(): void {
    const storedRoleLabel = this.resolveStoredRoleLabel();

    if (storedRoleLabel === null) {
      return;
    }

    this.lecturerProfile.update((profile) => ({
      ...profile,
      roleLabel: storedRoleLabel,
    }));
  }

  private resolveStoredRoleLabel(): string | null {
    const storedUserType = sessionStorage.getItem('USER_TYPE');

    if (!storedUserType || storedUserType.trim().length === 0) {
      return null;
    }

    return storedUserType
      .split('_')
      .map((segment) =>
        segment.length > 0
          ? segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
          : '',
      )
      .join(' ');
  }

  private mapCurrentUserProfile(response: unknown): Partial<LecturerProfile> {
    const responseRecord = this.asRecord(response);
    const dataRecord =
      this.asRecord(responseRecord?.['data']) ?? responseRecord;
    const userRecord = this.asRecord(dataRecord?.['user']) ?? dataRecord;
    const departmentRecord =
      this.asRecord(userRecord?.['department']) ??
      this.asRecord(dataRecord?.['department']);
    const facultyRecord =
      this.asRecord(userRecord?.['faculty']) ??
      this.asRecord(dataRecord?.['faculty']) ??
      this.asRecord(userRecord?.['school']) ??
      this.asRecord(dataRecord?.['school']);
    const roleRecord =
      this.asRecord(userRecord?.['role']) ??
      this.asRecord(dataRecord?.['role']);

    return {
      fullName:
        this.readString(userRecord, 'name') ??
        this.readString(dataRecord, 'name') ??
        this.readString(userRecord, 'full_name') ??
        this.readString(dataRecord, 'full_name') ??
        this.buildFullName(userRecord) ??
        this.buildFullName(dataRecord) ??
        undefined,
      roleLabel:
        this.readString(roleRecord, 'name') ??
        this.readString(userRecord, 'user_type') ??
        this.readString(dataRecord, 'user_type') ??
        this.readString(userRecord, 'role') ??
        this.readString(dataRecord, 'role') ??
        undefined,
      departmentLabel:
        this.readString(userRecord, 'department') ??
        this.readString(dataRecord, 'department') ??
        this.readString(departmentRecord, 'name') ??
        this.readString(userRecord, 'department_name') ??
        this.readString(dataRecord, 'department_name') ??
        undefined,
      facultyLabel:
        this.readString(facultyRecord, 'name') ??
        this.readString(userRecord, 'faculty_name') ??
        this.readString(dataRecord, 'faculty_name') ??
        this.readString(userRecord, 'school_name') ??
        this.readString(dataRecord, 'school_name') ??
        undefined,
      emailAddress:
        this.readString(userRecord, 'email') ??
        this.readString(dataRecord, 'email') ??
        undefined,
      phoneNumber:
        this.readString(userRecord, 'phone_number') ??
        this.readString(dataRecord, 'phone_number') ??
        this.readString(userRecord, 'phone') ??
        this.readString(dataRecord, 'phone') ??
        undefined,
      officeLocation:
        this.readString(userRecord, 'office_location') ??
        this.readString(dataRecord, 'office_location') ??
        this.readString(userRecord, 'office') ??
        this.readString(dataRecord, 'office') ??
        undefined,
    };
  }

  private syncCourseDepartmentLabels(departmentLabel: string): void {
    if (
      departmentLabel.trim().length === 0 ||
      departmentLabel === 'Department'
    ) {
      return;
    }

    this.state.update((currentState) => ({
      ...currentState,
      courses: currentState.courses.map((course) => ({
        ...course,
        departmentLabel,
      })),
    }));
  }

  private buildFullName(record: UnknownRecord | null): string | null {
    if (record === null) {
      return null;
    }

    const nameParts = [
      this.readString(record, 'first_name'),
      this.readString(record, 'last_name'),
      this.readString(record, 'other_names'),
    ].filter((value): value is string => value !== null);

    return nameParts.length > 0 ? nameParts.join(' ') : null;
  }

  private asRecord(value: unknown): UnknownRecord | null {
    return value !== null && typeof value === 'object'
      ? (value as UnknownRecord)
      : null;
  }

  private readString(record: UnknownRecord | null, key: string): string | null {
    if (record === null) {
      return null;
    }

    const value = record[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }
}

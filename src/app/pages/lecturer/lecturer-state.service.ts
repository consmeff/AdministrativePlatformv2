import { Injectable, computed, signal } from '@angular/core';
import {
  LECTURER_COURSES,
  LECTURER_DEFAULT_RESULT_TEMPLATE_NAME,
  LECTURER_PROFILE,
  LECTURER_RESULT_TEMPLATE_HEADERS,
} from './lecturer.constants';
import {
  LecturerCourse,
  LecturerProfile,
  LecturerStudentResult,
} from './lecturer.types';

interface LecturerCoursesState {
  courses: LecturerCourse[];
}

@Injectable({
  providedIn: 'root',
})
export class LecturerStateService {
  private readonly state = signal<LecturerCoursesState>({
    courses: LECTURER_COURSES,
  });

  readonly lecturerProfile = signal<LecturerProfile>(LECTURER_PROFILE);
  readonly courses = computed(() => this.state().courses);

  getCourseById(courseId: string): LecturerCourse | null {
    return this.courses().find((course) => course.id === courseId) ?? null;
  }

  updateCourseStudents(
    courseId: string,
    students: LecturerStudentResult[],
    successMessage: string,
  ): void {
    this.state.update((currentState) => ({
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
}

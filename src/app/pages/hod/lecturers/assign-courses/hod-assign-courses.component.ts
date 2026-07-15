import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../widgets/button/button.component';
import { FilterSelectComponent } from '../../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../../widgets/search-input/search-input.component';
import { HOD_LEVEL_FILTER_OPTIONS } from '../../hod.constants';
import { HodStateService } from '../../hod-state.service';
import {
  HodLecturer,
  HodLecturerAssignmentHistoryRecord,
  HodLecturerCourse,
  HodLevelFilterOption,
} from '../../hod.types';
import { LecturerAssignmentHistoryModalComponent } from '../lecturer-assignment-history-modal.component';

interface PendingAssignmentChange {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  lecturerId: string;
  lecturerName: string;
  action: HodLecturerAssignmentHistoryRecord['action'];
}

@Component({
  selector: 'app-hod-assign-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SearchInputComponent,
    FilterSelectComponent,
    ButtonComponent,
    LecturerAssignmentHistoryModalComponent,
  ],
  templateUrl: './hod-assign-courses.component.html',
  styleUrl: './hod-assign-courses.component.scss',
})
export class HodAssignCoursesComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly levelOptions = HOD_LEVEL_FILTER_OPTIONS;
  readonly selectedLevel = signal<HodLevelFilterOption>(this.levelOptions[0]);
  readonly lecturerSearchTerm = signal('');
  readonly historyVisible = signal(false);
  readonly isSavingChanges = signal(false);
  readonly pendingChanges = signal<PendingAssignmentChange[]>([]);
  readonly selectedCourseId = signal<string | null>(
    this.getFirstCourseIdByLevel(this.levelOptions[0].value),
  );

  readonly filteredCourses = computed(() =>
    this.hodStateService
      .lecturerCourses()
      .filter((course) => course.levelValue === this.selectedLevel().value),
  );

  readonly selectedCourse = computed(() => {
    const selectedCourseId = this.selectedCourseId();
    const filteredCourses = this.filteredCourses();

    if (selectedCourseId) {
      const matchedCourse = filteredCourses.find(
        (course) => course.id === selectedCourseId,
      );

      if (matchedCourse) {
        return matchedCourse;
      }
    }

    return filteredCourses[0] ?? null;
  });

  readonly assignedLecturers = computed(() => {
    const selectedCourse = this.selectedCourse();

    if (!selectedCourse) {
      return [];
    }

    const assignedLecturerIds = new Set(selectedCourse.assignedLecturerIds);

    return this.hodStateService
      .lecturers()
      .filter((lecturer) => assignedLecturerIds.has(lecturer.id));
  });

  readonly availableLecturers = computed(() => {
    const selectedCourse = this.selectedCourse();
    const normalizedSearchTerm = this.lecturerSearchTerm().trim().toLowerCase();

    return this.hodStateService.lecturers().filter((lecturer) => {
      const matchesSearchTerm =
        !normalizedSearchTerm ||
        lecturer.fullName.toLowerCase().includes(normalizedSearchTerm);
      const isAlreadyAssigned =
        selectedCourse?.assignedLecturerIds.includes(lecturer.id) ?? false;

      return matchesSearchTerm && !isAlreadyAssigned;
    });
  });

  readonly assignmentHistory = this.hodStateService.lecturerAssignmentHistory;
  readonly hasUnsavedChanges = computed(() => this.pendingChanges().length > 0);

  onLevelChange(level: HodLevelFilterOption): void {
    this.selectedLevel.set(level);
    this.selectedCourseId.set(this.getFirstCourseIdByLevel(level.value));
    this.lecturerSearchTerm.set('');
  }

  onLecturerSearchTermChange(searchTerm: string): void {
    this.lecturerSearchTerm.set(searchTerm);
  }

  selectCourse(courseId: string): void {
    this.selectedCourseId.set(courseId);
  }

  assignLecturer(lecturerId: string): void {
    const selectedCourse = this.selectedCourse();
    const lecturer = this.hodStateService.getLecturerById(lecturerId);

    if (!selectedCourse || !lecturer) {
      return;
    }

    this.hodStateService.assignLecturerToCourse(selectedCourse.id, lecturerId);
    this.registerPendingChange(selectedCourse, lecturer, 'assigned');
  }

  removeLecturer(lecturerId: string): void {
    const selectedCourse = this.selectedCourse();
    const lecturer = this.hodStateService.getLecturerById(lecturerId);

    if (!selectedCourse || !lecturer) {
      return;
    }

    this.hodStateService.removeLecturerFromCourse(
      selectedCourse.id,
      lecturerId,
    );
    this.registerPendingChange(selectedCourse, lecturer, 'removed');
  }

  saveChanges(): void {
    const pendingChanges = this.pendingChanges();

    if (pendingChanges.length === 0 || this.isSavingChanges()) {
      return;
    }

    this.isSavingChanges.set(true);
    this.hodStateService
      .saveLecturerCourseAssignments(pendingChanges)
      .subscribe({
        next: () => {
          this.pendingChanges.set([]);
          this.isSavingChanges.set(false);
        },
        error: () => {
          this.isSavingChanges.set(false);
        },
      });
  }

  openHistory(): void {
    this.historyVisible.set(true);
  }

  closeHistory(): void {
    this.historyVisible.set(false);
  }

  getAssignedLecturerCount(course: HodLecturerCourse): string {
    const assignedLecturerCount = course.assignedLecturerIds.length;

    if (assignedLecturerCount === 0) {
      return 'Unassigned';
    }

    if (assignedLecturerCount === 1) {
      return '1 Lecturer';
    }

    return `${assignedLecturerCount} Lecturers`;
  }

  getAssignedLecturerCountClass(course: HodLecturerCourse): string {
    return course.assignedLecturerIds.length === 0 ? 'is-unassigned' : '';
  }

  private getFirstCourseIdByLevel(levelValue: string): string | null {
    return (
      this.hodStateService
        .lecturerCourses()
        .find((course) => course.levelValue === levelValue)?.id ?? null
    );
  }

  private registerPendingChange(
    course: HodLecturerCourse,
    lecturer: HodLecturer,
    action: PendingAssignmentChange['action'],
  ): void {
    this.pendingChanges.update((currentChanges) => {
      const existingChangeIndex = currentChanges.findIndex(
        (change) =>
          change.courseId === course.id && change.lecturerId === lecturer.id,
      );

      if (existingChangeIndex >= 0) {
        const existingChange = currentChanges[existingChangeIndex];

        if (existingChange.action !== action) {
          return currentChanges.filter(
            (_, index) => index !== existingChangeIndex,
          );
        }

        return currentChanges;
      }

      return [
        ...currentChanges,
        {
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          lecturerId: lecturer.id,
          lecturerName: lecturer.fullName,
          action,
        },
      ];
    });
  }
}

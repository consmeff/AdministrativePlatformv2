import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import { HodStateService } from '../hod-state.service';
import { HodLecturer, HodLecturerCourse } from '../hod.types';
import { LecturerAssignedCoursesModalComponent } from './lecturer-assigned-courses-modal.component';

@Component({
  selector: 'app-hod-lecturers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SearchInputComponent,
    ButtonComponent,
    LecturerAssignedCoursesModalComponent,
  ],
  templateUrl: './hod-lecturers.component.html',
  styleUrl: './hod-lecturers.component.scss',
})
export class HodLecturersComponent {
  private readonly hodStateService = inject(HodStateService);

  constructor() {
    this.hodStateService.ensureProfileLoaded();
    this.hodStateService.loadLecturers();
  }

  readonly searchTerm = signal('');
  readonly activeLecturerId = signal<string | null>(null);
  readonly lecturers = this.hodStateService.lecturers;

  readonly filteredLecturers = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();

    return this.lecturers().filter((lecturer) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      return (
        lecturer.fullName.toLowerCase().includes(normalizedSearchTerm) ||
        lecturer.staffId.toLowerCase().includes(normalizedSearchTerm)
      );
    });
  });

  readonly activeLecturer = computed(() => {
    const lecturerId = this.activeLecturerId();

    if (!lecturerId) {
      return null;
    }

    return this.hodStateService.getLecturerById(lecturerId);
  });

  readonly activeLecturerCourses = computed(() => {
    const activeLecturer = this.activeLecturer();

    if (!activeLecturer) {
      return [];
    }

    return this.getLecturerCourses(activeLecturer);
  });

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  openAssignedCoursesModal(lecturerId: string): void {
    this.activeLecturerId.set(lecturerId);
  }

  closeAssignedCoursesModal(): void {
    this.activeLecturerId.set(null);
  }

  getAssignedCourseCount(lecturer: HodLecturer): number {
    return lecturer.assignedCourseIds.length;
  }

  getLecturerCourses(lecturer: HodLecturer): HodLecturerCourse[] {
    const assignedCourseIds = new Set(lecturer.assignedCourseIds);

    return this.hodStateService
      .lecturerCourses()
      .filter((course) => assignedCourseIds.has(course.id));
  }
}

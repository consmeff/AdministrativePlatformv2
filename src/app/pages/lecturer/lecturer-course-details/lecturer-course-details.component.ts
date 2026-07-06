import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { PortalContextService } from '../../../services/portal-context.service';
import { BusyIndicatorService } from '../../../services/busy-indicator.service';
import { NotificationService } from '../../../services/notification.service';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { resolveLecturerGrade } from '../lecturer.constants';
import { LecturerResultsService } from '../lecturer-results.service';
import { LecturerStateService } from '../lecturer-state.service';
import { LecturerStudentResult } from '../lecturer.types';

@Component({
  selector: 'app-lecturer-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './lecturer-course-details.component.html',
  styleUrl: './lecturer-course-details.component.scss',
})
export class LecturerCourseDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly lecturerStateService = inject(LecturerStateService);
  private readonly portalContextService = inject(PortalContextService);
  private readonly lecturerResultsService = inject(LecturerResultsService);
  private readonly busyIndicatorService = inject(BusyIndicatorService);
  private readonly notificationService = inject(NotificationService);

  readonly hasLoaded = computed(() => this.lecturerStateService.hasLoaded());
  readonly editingStudentRowId = signal<string | null>(null);
  readonly editedContinuousAssessmentScore = signal<number | null>(null);
  readonly editedExamScore = signal<number | null>(null);
  readonly isSavingStudent = signal(false);

  readonly editedTotalScore = computed(() => {
    const continuousAssessmentScore =
      this.editedContinuousAssessmentScore() ?? 0;
    const examScore = this.editedExamScore() ?? 0;

    return continuousAssessmentScore + examScore;
  });

  readonly editedGrade = computed(() =>
    resolveLecturerGrade(this.editedTotalScore()),
  );

  private loadIntervalId: ReturnType<typeof globalThis.setInterval> | null =
    null;
  readonly courseId = computed(() =>
    this.route.snapshot.paramMap.get('courseId'),
  );
  readonly course = computed(() => {
    const courseId = this.courseId();

    if (!courseId) {
      return null;
    }

    return this.lecturerStateService.getCourseById(courseId);
  });

  ngOnInit(): void {
    const courseId = this.courseId();

    if (!courseId) {
      return;
    }

    this.tryLoadCourseResults(courseId);

    if (this.hasLoaded()) {
      return;
    }

    this.clearLoadInterval();
    let attempts = 0;

    this.loadIntervalId = globalThis.setInterval(() => {
      attempts += 1;

      if (this.hasLoaded()) {
        this.tryLoadCourseResults(courseId);
        this.clearLoadInterval();
        return;
      }

      if (attempts >= 40) {
        this.clearLoadInterval();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearLoadInterval();
  }

  exportStudentScores(): void {
    const course = this.course();

    if (!course || course.students.length === 0) {
      return;
    }

    const csvRows = [
      ['Student Name', 'Matric No.', 'C.A.', 'Exam', 'Total', 'Grade'].join(
        ',',
      ),
      ...course.students.map((student) =>
        [
          student.studentName,
          student.matricNo,
          student.continuousAssessmentScore,
          student.examScore,
          student.totalScore,
          student.grade,
        ].join(','),
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const objectUrl = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = `${course.code.toLowerCase().replace(/\s+/g, '-')}-scores.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    globalThis.URL.revokeObjectURL(objectUrl);
  }

  get roleBasePath(): string {
    return this.portalContextService.getRoleBasePath();
  }

  beginEditStudent(student: LecturerStudentResult): void {
    this.editingStudentRowId.set(student.id);
    this.editedContinuousAssessmentScore.set(student.continuousAssessmentScore);
    this.editedExamScore.set(student.examScore);
  }

  cancelEditStudent(): void {
    this.editingStudentRowId.set(null);
    this.editedContinuousAssessmentScore.set(null);
    this.editedExamScore.set(null);
  }

  onEditedContinuousAssessmentChange(event: Event): void {
    this.editedContinuousAssessmentScore.set(this.readScoreInput(event));
  }

  onEditedExamScoreChange(event: Event): void {
    this.editedExamScore.set(this.readScoreInput(event));
  }

  saveStudentResult(courseId: string, student: LecturerStudentResult): void {
    if (this.isSavingStudent()) {
      return;
    }

    const numericCourseId = Number(courseId);
    const studentId = student.studentId;

    if (!Number.isFinite(numericCourseId) || studentId === null) {
      return;
    }

    const continuousAssessmentScore =
      this.editedContinuousAssessmentScore() ?? 0;
    const examScore = this.editedExamScore() ?? 0;
    const totalScore = continuousAssessmentScore + examScore;

    this.isSavingStudent.set(true);
    this.busyIndicatorService.show();

    this.lecturerResultsService
      .updateStudentResults({
        student_id: studentId,
        results: [
          {
            course_id: numericCourseId,
            test_score: continuousAssessmentScore,
            exam_score: examScore,
            grade: resolveLecturerGrade(totalScore),
          },
        ],
      })
      .pipe(
        finalize(() => {
          this.isSavingStudent.set(false);
          this.busyIndicatorService.hide();
        }),
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Student result updated.');
          this.cancelEditStudent();
          this.lecturerStateService.loadCourseResults(courseId);
        },
        error: () => {
          this.notificationService.error('Unable to update student result.');
        },
      });
  }

  private tryLoadCourseResults(courseId: string): void {
    this.lecturerStateService.loadCourseResults(courseId);
  }

  private clearLoadInterval(): void {
    if (this.loadIntervalId !== null) {
      globalThis.clearInterval(this.loadIntervalId);
      this.loadIntervalId = null;
    }
  }

  private readScoreInput(event: Event): number {
    const target = event.target;
    const input = target instanceof HTMLInputElement ? target : null;
    const numericValue = input ? Number(input.value) : NaN;
    const clampedValue = Number.isFinite(numericValue)
      ? Math.max(0, numericValue)
      : 0;

    return clampedValue;
  }
}

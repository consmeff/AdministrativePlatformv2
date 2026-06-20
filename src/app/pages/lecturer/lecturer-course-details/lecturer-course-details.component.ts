import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PortalContextService } from '../../../services/portal-context.service';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { LecturerStateService } from '../lecturer-state.service';

@Component({
  selector: 'app-lecturer-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './lecturer-course-details.component.html',
  styleUrl: './lecturer-course-details.component.scss',
})
export class LecturerCourseDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly lecturerStateService = inject(LecturerStateService);
  private readonly portalContextService = inject(PortalContextService);

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
}

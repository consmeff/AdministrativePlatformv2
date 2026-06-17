import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PortalContextService } from '../../../services/portal-context.service';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { LecturerStateService } from '../lecturer-state.service';

@Component({
  selector: 'app-lecturer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './lecturer-dashboard.component.html',
  styleUrl: './lecturer-dashboard.component.scss',
})
export class LecturerDashboardComponent {
  private readonly lecturerStateService = inject(LecturerStateService);
  private readonly portalContextService = inject(PortalContextService);

  readonly lecturerProfile = this.lecturerStateService.lecturerProfile;
  readonly courses = this.lecturerStateService.courses;
  readonly dashboardMetrics = computed(() => {
    const courses = this.courses();
    const totalStudents = courses.reduce(
      (studentCount, course) => studentCount + course.students.length,
      0,
    );
    const coursesWithUploads = courses.filter(
      (course) => course.uploadSummary.lastUploadedAt !== null,
    ).length;

    return [
      {
        label: 'Assigned Courses',
        value: String(courses.length),
      },
      {
        label: 'Registered Students',
        value: String(totalStudents),
      },
      {
        label: 'Completed Uploads',
        value: String(coursesWithUploads),
      },
    ];
  });

  get roleBasePath(): string {
    return this.portalContextService.getRoleBasePath();
  }
}

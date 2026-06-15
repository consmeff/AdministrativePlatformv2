import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LecturerStateService } from '../lecturer-state.service';

@Component({
  selector: 'app-lecturer-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lecturer-my-courses.component.html',
  styleUrl: './lecturer-my-courses.component.scss',
})
export class LecturerMyCoursesComponent {
  private readonly lecturerStateService = inject(LecturerStateService);

  readonly courses = this.lecturerStateService.courses;
}

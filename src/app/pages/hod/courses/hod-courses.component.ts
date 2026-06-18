import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HodStateService } from '../hod-state.service';

@Component({
  selector: 'app-hod-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hod-courses.component.html',
  styleUrl: './hod-courses.component.scss',
})
export class HodCoursesComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly overviewLevels = this.hodStateService.courseOverviewLevels;
}

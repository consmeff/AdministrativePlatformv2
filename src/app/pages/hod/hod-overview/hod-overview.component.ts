import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { HodStateService } from '../hod-state.service';

@Component({
  selector: 'app-hod-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hod-overview.component.html',
  styleUrl: './hod-overview.component.scss',
})
export class HodOverviewComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly overviewMetrics = computed(() => [
    {
      label: 'Registrations awaiting review',
      value: String(this.hodStateService.pendingCourseRegistrationCount()),
    },
    {
      label: 'Documents awaiting verification',
      value: String(this.hodStateService.pendingDocumentVerificationCount()),
    },
    {
      label: 'Flagged submissions',
      value: String(this.hodStateService.flaggedDocumentCount()),
    },
  ]);
}

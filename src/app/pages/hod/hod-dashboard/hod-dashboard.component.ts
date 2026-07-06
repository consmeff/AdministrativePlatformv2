import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { HodStateService } from '../hod-state.service';

@Component({
  selector: 'app-hod-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './hod-dashboard.component.html',
  styleUrl: './hod-dashboard.component.scss',
})
export class HodDashboardComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly profile = this.hodStateService.profile;
  readonly dashboardCards = computed(() => [
    {
      label: 'Pending Course Review',
      value: String(this.hodStateService.pendingCourseRegistrationCount()),
    },
    {
      label: 'Rejected Registration',
      value: String(this.hodStateService.rejectedCourseRegistrationCount()),
    },
    {
      label: 'Pending Documents',
      value: String(this.hodStateService.pendingDocumentVerificationCount()),
    },
    {
      label: 'Flagged Documents',
      value: String(this.hodStateService.flaggedDocumentCount()),
    },
  ]);
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HodStateService } from '../hod-state.service';

@Component({
  selector: 'app-hod-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hod-profile.component.html',
  styleUrl: './hod-profile.component.scss',
})
export class HodProfileComponent {
  private readonly hodStateService = inject(HodStateService);

  constructor() {
    this.hodStateService.ensureProfileLoaded();
  }

  readonly profile = this.hodStateService.profile;
}

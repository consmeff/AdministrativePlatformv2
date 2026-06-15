import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LecturerStateService } from '../lecturer-state.service';

@Component({
  selector: 'app-lecturer-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecturer-profile.component.html',
  styleUrl: './lecturer-profile.component.scss',
})
export class LecturerProfileComponent {
  private readonly lecturerStateService = inject(LecturerStateService);

  readonly lecturerProfile = this.lecturerStateService.lecturerProfile;
}

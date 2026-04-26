import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type StatusTone =
  | 'pending'
  | 'shortlisted'
  | 'directive'
  | 'resubmitted'
  | 'rejected'
  | 'neutral';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-indicator.component.html',
  styleUrl: './status-indicator.component.scss',
})
export class StatusIndicatorComponent {
  @Input() text = '';
  @Input() tone: StatusTone = 'neutral';
  @Input() dot = true;
  @Input() pill = false;
}

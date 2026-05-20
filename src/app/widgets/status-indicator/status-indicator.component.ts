import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ApplicationStatusTone } from '../../constants/application-status.types';

export type StatusTone = ApplicationStatusTone;

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
  @Input() tooltip = '';
  @Input() dot = true;
  @Input() pill = false;
}

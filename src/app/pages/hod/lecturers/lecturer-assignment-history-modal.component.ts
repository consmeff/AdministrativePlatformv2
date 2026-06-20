import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HodLecturerAssignmentHistoryRecord } from '../hod.types';

@Component({
  selector: 'app-lecturer-assignment-history-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecturer-assignment-history-modal.component.html',
  styleUrl: './lecturer-assignment-history-modal.component.scss',
})
export class LecturerAssignmentHistoryModalComponent {
  @Input() visible = false;
  @Input() records: HodLecturerAssignmentHistoryRecord[] = [];
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  getActionLabel(record: HodLecturerAssignmentHistoryRecord): string {
    return record.action === 'assigned' ? 'Assigned' : 'Removed';
  }
}

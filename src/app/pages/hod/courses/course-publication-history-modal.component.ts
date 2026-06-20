import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HodCoursePublicationHistoryRecord } from '../hod.types';

@Component({
  selector: 'app-course-publication-history-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-publication-history-modal.component.html',
  styleUrl: './course-publication-history-modal.component.scss',
})
export class CoursePublicationHistoryModalComponent {
  @Input() visible = false;
  @Input() records: HodCoursePublicationHistoryRecord[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() duplicateRequested = new EventEmitter<string>();

  close(): void {
    this.closed.emit();
  }

  duplicate(levelValue: string): void {
    this.duplicateRequested.emit(levelValue);
  }
}

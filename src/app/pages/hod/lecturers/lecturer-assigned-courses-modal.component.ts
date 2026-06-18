import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HodLecturerCourse } from '../hod.types';

@Component({
  selector: 'app-lecturer-assigned-courses-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecturer-assigned-courses-modal.component.html',
  styleUrl: './lecturer-assigned-courses-modal.component.scss',
})
export class LecturerAssignedCoursesModalComponent {
  @Input() visible = false;
  @Input() lecturerName = '';
  @Input() courses: HodLecturerCourse[] = [];
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}

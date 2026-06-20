import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../../../../widgets/button/button.component';
import { HodCourseRegistrationRecord } from '../../hod.types';

@Component({
  selector: 'app-course-registration-review-drawer',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './course-registration-review-drawer.component.html',
  styleUrl: './course-registration-review-drawer.component.scss',
})
export class CourseRegistrationReviewDrawerComponent {
  @Input() record: HodCourseRegistrationRecord | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() approved = new EventEmitter<string>();
  @Output() rejected = new EventEmitter<string>();

  get canApprove(): boolean {
    return (
      this.record?.status !== 'approved' && this.record?.status !== 'rejected'
    );
  }

  get canReject(): boolean {
    return this.record?.status !== 'rejected';
  }

  get studentInitials(): string {
    const record = this.record;

    if (!record) {
      return '';
    }

    return record.studentName
      .split(' ')
      .slice(0, 2)
      .map((namePart) => namePart.charAt(0))
      .join('')
      .toUpperCase();
  }

  approve(): void {
    if (this.record && this.canApprove) {
      this.approved.emit(this.record.id);
    }
  }

  reject(): void {
    if (this.record && this.canReject) {
      this.rejected.emit(this.record.id);
    }
  }
}

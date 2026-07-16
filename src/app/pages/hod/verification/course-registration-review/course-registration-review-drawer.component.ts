import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
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
  readonly record = input<HodCourseRegistrationRecord | null>(null);
  readonly isLoading = input(false);
  readonly isApproving = input(false);
  readonly closed = output<void>();
  readonly approved = output<string>();
  readonly rejected = output<string>();

  get canApprove(): boolean {
    return (
      this.record()?.status !== 'approved' &&
      this.record()?.status !== 'rejected' &&
      !this.isApproving()
    );
  }

  get canReject(): boolean {
    return (
      this.record()?.status !== 'rejected' &&
      this.record()?.status !== 'approved' &&
      !this.isApproving()
    );
  }

  get studentInitials(): string {
    const record = this.record();

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
    const record = this.record();

    if (record && this.canApprove) {
      this.approved.emit(record.id);
    }
  }

  reject(): void {
    const record = this.record();

    if (record && this.canReject) {
      this.rejected.emit(record.id);
    }
  }

  close(): void {
    this.closed.emit();
  }
}

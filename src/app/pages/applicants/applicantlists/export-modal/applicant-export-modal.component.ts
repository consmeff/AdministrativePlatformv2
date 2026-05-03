import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '../../../../widgets/button/button.component';

interface ExportOption {
  label: string;
  value: string;
}

export interface ApplicantExportSelection {
  fields: string[];
  approval_status?: string;
}

@Component({
  selector: 'app-applicant-export-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonComponent],
  templateUrl: './applicant-export-modal.component.html',
  styleUrl: './applicant-export-modal.component.scss',
})
export class ApplicantExportModalComponent {
  @Input() visible = false;
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() exported = new EventEmitter<ApplicantExportSelection>();

  readonly exportFieldOptions: ExportOption[] = [
    { label: 'Status', value: 'approval_status' },
    { label: 'JAMB Score', value: 'jamb_score' },
    { label: 'JAMB Registration No.', value: 'jamb_registration_no' },
    { label: 'O Level Result', value: 'o_level_result' },
    { label: 'Programme', value: 'programme' },
    { label: 'Email Address', value: 'email' },
  ];

  readonly exportStatusOptions: ExportOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending Review', value: 'Pending' },
    { label: 'Shortlisted Candidates', value: 'Shortlisted' },
    { label: 'Directive Issued', value: 'Complaince Required' },
    { label: 'Resubmitted', value: 'Resubmited' },
  ];

  selectedFields: string[] = ['approval_status', 'jamb_score', 'programme'];
  selectedStatus = 'all';

  isFieldChecked(value: string): boolean {
    return this.selectedFields.includes(value);
  }

  toggleField(value: string, checked: boolean): void {
    if (checked && !this.selectedFields.includes(value)) {
      this.selectedFields = [...this.selectedFields, value];
      return;
    }

    if (!checked) {
      this.selectedFields = this.selectedFields.filter(
        (field) => field !== value,
      );
      if (value === 'approval_status') {
        this.selectedStatus = 'all';
      }
    }
  }

  isStatusFieldSelected(): boolean {
    return this.selectedFields.includes('approval_status');
  }

  isStatusChecked(value: string): boolean {
    return this.selectedStatus === value;
  }

  toggleStatus(value: string, checked: boolean): void {
    if (!checked && this.selectedStatus === value) {
      this.selectedStatus = 'all';
      return;
    }
    this.selectedStatus = checked ? value : 'all';
  }

  onClose(): void {
    this.closed.emit();
  }

  onExport(): void {
    this.exported.emit({
      fields: this.selectedFields,
      approval_status:
        this.isStatusFieldSelected() && this.selectedStatus !== 'all'
          ? this.selectedStatus
          : undefined,
    });
  }
}

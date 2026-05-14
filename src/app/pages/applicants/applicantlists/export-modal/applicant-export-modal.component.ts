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
    { label: 'ID', value: 'id' },
    { label: 'Application No.', value: 'application_no' },
    { label: 'UTME Reg No.', value: 'utme_reg_no' },
    { label: 'First Name', value: 'first_name' },
    { label: 'Last Name', value: 'last_name' },
    { label: 'Other Names', value: 'other_names' },
    { label: 'Email', value: 'email' },
    { label: 'Post UTME Point', value: 'post_utme_point' },
    { label: 'Phone Number', value: 'phone_number' },
    { label: 'Alt Phone Number', value: 'alt_phone_number' },
    { label: 'Gender', value: 'gender' },
    { label: 'Approval Status', value: 'approval_status' },
    { label: 'Payment Status', value: 'payment_status' },
    { label: 'Application ID', value: 'application_id' },
    { label: 'Program Name', value: 'program_name' },
    { label: 'Department Name', value: 'department_name' },
    { label: 'Approved Department', value: 'approved_department_name' },
    { label: 'O Level Point', value: 'o_level_point' },
    { label: 'Created At', value: 'created_at' },
    { label: 'Updated At', value: 'updated_at' },
    { label: 'Compliance Directive', value: 'compliance_directive' },
  ];

  readonly exportStatusOptions: ExportOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending Review', value: 'Pending' },
    { label: 'Shortlisted Candidates', value: 'Shortlisted' },
    { label: 'Directive Issued', value: 'Complaince Required' },
    { label: 'Resubmitted', value: 'Resubmitted' },
  ];

  selectedFields: string[] = [
    'application_no',
    'first_name',
    'last_name',
    'approval_status',
  ];
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

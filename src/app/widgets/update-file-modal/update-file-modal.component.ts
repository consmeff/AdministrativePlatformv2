import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { DialogModule } from 'primeng/dialog';

interface UpdateFieldOption {
  label: string;
  value: string;
}

export interface UpdateFileSelection {
  file: File;
  fields: string[];
}

@Component({
  selector: 'app-update-file-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonComponent],
  templateUrl: './update-file-modal.component.html',
  styleUrl: './update-file-modal.component.scss',
})
export class UpdateFileModalComponent {
  @Input() visible = false;
  @Input() loading = false;
  @Input() title = 'Update with File';
  @Input() subtitle = 'Select fields to update and upload your file.';
  @Input() fieldOptions: UpdateFieldOption[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<UpdateFileSelection>();

  selectedFile: File | null = null;
  selectedFields: string[] = [];

  onClose(): void {
    this.closed.emit();
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

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
        (item) => item !== value,
      );
    }
  }

  submit(): void {
    if (!this.selectedFile || this.selectedFields.length === 0) {
      return;
    }
    this.submitted.emit({
      file: this.selectedFile,
      fields: this.selectedFields,
    });
  }
}

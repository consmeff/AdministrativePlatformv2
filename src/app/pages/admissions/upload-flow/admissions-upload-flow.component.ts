import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ApplicationService } from '../../../services/application.service';
import { NotificationService } from '../../../services/notification.service';

type AdmissionUploadMode = 'cbt' | 'document';

type AdmissionUploadStage =
  | 'upload'
  | 'file-selected'
  | 'syncing'
  | 'processing'
  | 'complete';

interface UploadFlowConfig {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-admissions-upload-flow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admissions-upload-flow.component.html',
  styleUrl: './admissions-upload-flow.component.scss',
})
export class AdmissionsUploadFlowComponent {
  private readonly notification = inject(NotificationService);
  private readonly applicationService = inject(ApplicationService);
  @Input() mode: AdmissionUploadMode = 'cbt';
  @Output() continueToAdmissions = new EventEmitter<void>();

  private readonly modeConfig: Record<AdmissionUploadMode, UploadFlowConfig> = {
    cbt: {
      title: 'Upload CBT Results File',
      subtitle: 'Upload the Excel or CSV file received from the CBT centre.',
    },
    document: {
      title: 'Document Review Upload',
      subtitle: 'Upload the completed review template.',
    },
  };

  stage: AdmissionUploadStage = 'upload';
  selectedFileName = '';
  selectedFileSize = '';
  uploadProgress = 0;
  processedRows = 0;
  totalRows = 247;
  private flowTimerId: number | null = null;
  private selectedFile: File | null = null;

  get activeFlow(): UploadFlowConfig {
    return this.modeConfig[this.mode];
  }

  get stageTitle(): string {
    if (this.stage === 'syncing') {
      return 'Syncing with existing';
    }
    if (this.stage === 'processing') {
      return 'Processing Document...';
    }
    if (this.stage === 'complete') {
      return 'File Syncing complete';
    }
    return this.activeFlow.title;
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.selectedFileName = file.name;
    this.selectedFileSize = this.formatFileSize(file.size);
    this.selectedFile = file;
    this.stage = 'file-selected';
    this.uploadProgress = 0;
    this.processedRows = 0;
    this.clearFlowTimer();
  }

  removeSelectedFile(fileInput: HTMLInputElement): void {
    this.resetFlow(fileInput);
  }

  startSyncing(): void {
    if (!this.selectedFileName) {
      return;
    }
    this.stage = 'syncing';
    this.uploadProgress = 60;
  }

  processUpdate(): void {
    if (!this.selectedFileName || !this.selectedFile) {
      return;
    }
    this.stage = 'processing';
    this.uploadProgress = 0;
    this.processedRows = 0;
    this.clearFlowTimer();

    const maxRows = this.totalRows;
    const step = Math.max(1, Math.floor(maxRows / 40));

    this.flowTimerId = window.setInterval(() => {
      this.processedRows = Math.min(maxRows, this.processedRows + step);
      this.uploadProgress = Math.min(
        100,
        Math.round((this.processedRows / maxRows) * 100),
      );
    }, 160);

    this.applicationService
      .bulkUpdateApplicants({
        file: this.selectedFile,
        fields: 'post_utme_point',
      })
      .subscribe({
        next: () => {
          this.uploadProgress = 100;
          this.processedRows = this.totalRows;
          this.stage = 'complete';
          this.notification.success(
            this.mode === 'cbt'
              ? 'CBT results uploaded successfully.'
              : 'File update completed successfully.',
          );
        },
        error: () => {
          this.stage = 'file-selected';
          this.notification.error('Failed to upload file. Please try again.');
        },
        complete: () => {
          this.clearFlowTimer();
        },
      });
  }

  continue(): void {
    this.continueToAdmissions.emit();
  }

  onDownloadTemplate(): void {
    this.notification.warn('Template download is not yet wired.');
  }

  private resetFlow(fileInput: HTMLInputElement): void {
    this.stage = 'upload';
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.uploadProgress = 0;
    this.processedRows = 0;
    this.selectedFile = null;
    fileInput.value = '';
    this.clearFlowTimer();
  }

  private formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes <= 0) {
      return '0 KB';
    }
    const sizeInKb = Math.max(1, Math.round(sizeInBytes / 1024));
    return `${sizeInKb} KB`;
  }

  private clearFlowTimer(): void {
    if (this.flowTimerId !== null) {
      window.clearInterval(this.flowTimerId);
      this.flowTimerId = null;
    }
  }
}

import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ApplicationService } from '../../../services/application.service';
import { NotificationService } from '../../../services/notification.service';
import { ButtonComponent } from '../../../widgets/button/button.component';

type AdmissionUploadMode = 'cbt' | 'document';

type AdmissionUploadStage =
  | 'upload'
  | 'file-selected'
  | 'processing'
  | 'complete';

interface UploadFlowConfig {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-admissions-upload-flow',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './admissions-upload-flow.component.html',
  styleUrl: './admissions-upload-flow.component.scss',
})
export class AdmissionsUploadFlowComponent {
  private static readonly CBT_TEMPLATE_PATH = 'assets/templates/cbt-upload.csv';

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
  totalRows = 0;
  private selectedFile: File | null = null;

  get activeFlow(): UploadFlowConfig {
    return this.modeConfig[this.mode];
  }

  get stageTitle(): string {
    if (this.stage === 'processing') {
      return 'Uploading CBT Results...';
    }
    if (this.stage === 'complete') {
      return 'Upload complete';
    }
    return this.activeFlow.title;
  }

  get acceptedFileTypes(): string {
    return this.mode === 'cbt' ? '.csv' : '.csv,.xls,.xlsx';
  }

  get startButtonLabel(): string {
    return this.stage === 'processing' ? 'Uploading...' : 'Start Update';
  }

  get completionButtonLabel(): string {
    return this.mode === 'cbt'
      ? 'Continue to Admissions'
      : 'Back to Admissions';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (this.mode === 'cbt' && !file.name.toLowerCase().endsWith('.csv')) {
      input.value = '';
      this.notification.warn('Please upload the CBT CSV template.');
      return;
    }

    this.selectedFileName = file.name;
    this.selectedFileSize = this.formatFileSize(file.size);
    this.selectedFile = file;
    this.stage = 'file-selected';
    this.uploadProgress = 0;
    this.processedRows = 0;
    this.totalRows =
      this.mode === 'cbt' ? await this.countCsvDataRows(file) : 0;
  }

  removeSelectedFile(fileInput: HTMLInputElement): void {
    this.resetFlow(fileInput);
  }

  startUpload(): void {
    if (!this.selectedFileName || !this.selectedFile) {
      return;
    }
    this.stage = 'processing';
    this.uploadProgress = 0;
    this.processedRows = 0;

    this.applicationService
      .bulkUpdateApplicantsWithProgress({
        file: this.selectedFile,
        fields: 'post_utme_point',
      })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.updateUploadProgress(event.loaded, event.total);
            return;
          }
          if (event.type === HttpEventType.Response) {
            this.uploadProgress = 100;
            this.processedRows = this.totalRows;
            this.stage = 'complete';
            this.notification.success(
              this.mode === 'cbt'
                ? 'CBT results uploaded successfully.'
                : 'File update completed successfully.',
            );
          }
        },
        error: () => {
          this.stage = 'file-selected';
          this.uploadProgress = 0;
          this.processedRows = 0;
          this.notification.error('Failed to upload file. Please try again.');
        },
      });
  }

  continue(): void {
    this.continueToAdmissions.emit();
  }

  onDownloadTemplate(): void {
    const link = document.createElement('a');
    link.href = AdmissionsUploadFlowComponent.CBT_TEMPLATE_PATH;
    link.download = 'cbt-upload.csv';
    link.click();
  }

  private resetFlow(fileInput: HTMLInputElement): void {
    this.stage = 'upload';
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.uploadProgress = 0;
    this.processedRows = 0;
    this.totalRows = 0;
    this.selectedFile = null;
    fileInput.value = '';
  }

  private formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes <= 0) {
      return '0 KB';
    }
    const sizeInKb = Math.max(1, Math.round(sizeInBytes / 1024));
    return `${sizeInKb} KB`;
  }

  private async countCsvDataRows(file: File): Promise<number> {
    const rawText = await file.text();
    const nonEmptyLines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (nonEmptyLines.length === 0) {
      return 0;
    }

    return Math.max(nonEmptyLines.length - 1, 0);
  }

  private updateUploadProgress(loaded: number, total?: number): void {
    if (!total || total <= 0) {
      return;
    }

    const percent = Math.min(100, Math.round((loaded / total) * 100));
    this.uploadProgress = percent;
    this.processedRows = Math.min(
      this.totalRows,
      Math.round((percent / 100) * this.totalRows),
    );
  }
}

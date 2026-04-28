import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

type AdmissionUploadType =
  | 'cbt-results'
  | 'document-review'
  | 'admission-decision';

type AdmissionUploadStage =
  | 'upload'
  | 'file-selected'
  | 'syncing'
  | 'processing'
  | 'complete';

interface UploadFlowOption {
  type: AdmissionUploadType;
  label: string;
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
  @Output() continueToAdmissions = new EventEmitter<AdmissionUploadType>();

  readonly options: UploadFlowOption[] = [
    {
      type: 'cbt-results',
      label: 'CBT Results',
      title: 'Upload CBT Results File',
      subtitle: 'Upload the Excel or CSV file received from the CBT centre.',
    },
    {
      type: 'document-review',
      label: 'Document Review',
      title: 'Document Review Upload',
      subtitle: 'Upload the completed review template.',
    },
    {
      type: 'admission-decision',
      label: 'Admission Decision',
      title: 'Admission Decision Upload',
      subtitle:
        'Upload the completed decision template. Candidates marked "Admitted" will receive admission notifications.',
    },
  ];

  activeType: AdmissionUploadType = 'cbt-results';
  stage: AdmissionUploadStage = 'upload';
  selectedFileName = '';
  selectedFileSize = '';
  uploadProgress = 0;
  processedRows = 0;
  totalRows = 247;
  private flowTimerId: number | null = null;

  get activeFlowOption(): UploadFlowOption {
    return (
      this.options.find((item) => item.type === this.activeType) ??
      this.options[0]
    );
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
    return this.activeFlowOption.title;
  }

  selectType(type: AdmissionUploadType, fileInput: HTMLInputElement): void {
    if (this.activeType === type) {
      return;
    }
    this.activeType = type;
    this.resetFlow(fileInput);
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
    if (!this.selectedFileName) {
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

      if (this.processedRows >= maxRows) {
        this.clearFlowTimer();
        this.stage = 'complete';
      }
    }, 160);
  }

  continue(): void {
    this.continueToAdmissions.emit(this.activeType);
  }

  onDownloadTemplate(): void {
    window.alert('Template download is not yet wired.');
  }

  private resetFlow(fileInput: HTMLInputElement): void {
    this.stage = 'upload';
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.uploadProgress = 0;
    this.processedRows = 0;
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

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../widgets/button/button.component';
import {
  LECTURER_UPLOAD_ACCEPTED_FILE_TYPES,
  LECTURER_UPLOAD_PROGRESS_INTERVAL_MS,
  LECTURER_UPLOAD_PROGRESS_STEP,
  LECTURER_UPLOAD_STAGE,
  buildLecturerStudents,
} from '../lecturer.constants';
import { LecturerStateService } from '../lecturer-state.service';

type LecturerUploadStage =
  (typeof LECTURER_UPLOAD_STAGE)[keyof typeof LECTURER_UPLOAD_STAGE];

@Component({
  selector: 'app-lecturer-course-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './lecturer-course-upload.component.html',
  styleUrl: './lecturer-course-upload.component.scss',
})
export class LecturerCourseUploadComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lecturerStateService = inject(LecturerStateService);
  private uploadIntervalId: ReturnType<typeof globalThis.setInterval> | null =
    null;

  readonly courseId = computed(() =>
    this.route.snapshot.paramMap.get('courseId'),
  );
  readonly course = computed(() => {
    const courseId = this.courseId();

    if (!courseId) {
      return null;
    }

    return this.lecturerStateService.getCourseById(courseId);
  });

  readonly acceptedFileTypes = LECTURER_UPLOAD_ACCEPTED_FILE_TYPES;
  readonly stage = signal<LecturerUploadStage>(LECTURER_UPLOAD_STAGE.upload);
  readonly selectedFileName = signal('');
  readonly selectedFileSize = signal('');
  readonly uploadProgress = signal(0);
  readonly processedRows = signal(0);
  readonly totalRows = signal(0);

  private selectedFile: File | null = null;

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    this.selectedFile = file;
    this.selectedFileName.set(file.name);
    this.selectedFileSize.set(this.formatFileSize(file.size));
    this.totalRows.set(await this.resolveRowCount(file));
    this.uploadProgress.set(0);
    this.processedRows.set(0);
    this.stage.set(LECTURER_UPLOAD_STAGE.fileSelected);
  }

  removeSelectedFile(fileInput: HTMLInputElement): void {
    this.selectedFile = null;
    this.selectedFileName.set('');
    this.selectedFileSize.set('');
    this.uploadProgress.set(0);
    this.processedRows.set(0);
    this.totalRows.set(0);
    this.stage.set(LECTURER_UPLOAD_STAGE.upload);
    fileInput.value = '';
  }

  startUpload(): void {
    if (!this.selectedFile || this.totalRows() === 0) {
      return;
    }

    this.stage.set(LECTURER_UPLOAD_STAGE.processing);
    this.uploadProgress.set(0);
    this.processedRows.set(0);
    this.clearUploadInterval();

    this.uploadIntervalId = globalThis.setInterval(() => {
      const nextProgress = Math.min(
        100,
        this.uploadProgress() + LECTURER_UPLOAD_PROGRESS_STEP,
      );
      const nextProcessedRows = Math.min(
        this.totalRows(),
        Math.round((nextProgress / 100) * this.totalRows()),
      );

      this.uploadProgress.set(nextProgress);
      this.processedRows.set(nextProcessedRows);

      if (nextProgress >= 100) {
        this.completeUpload();
      }
    }, LECTURER_UPLOAD_PROGRESS_INTERVAL_MS);
  }

  downloadTemplate(): void {
    this.lecturerStateService.downloadTemplate();
  }

  goBackToCourse(): void {
    const course = this.course();

    if (!course) {
      this.router.navigateByUrl('/pages/lecturer/my-courses');
      return;
    }

    this.router.navigate(['/pages/lecturer/my-courses', course.id]);
  }

  ngOnDestroy(): void {
    this.clearUploadInterval();
  }

  private clearUploadInterval(): void {
    if (this.uploadIntervalId !== null) {
      globalThis.clearInterval(this.uploadIntervalId);
      this.uploadIntervalId = null;
    }
  }

  private completeUpload(): void {
    const course = this.course();

    if (!course) {
      this.clearUploadInterval();
      return;
    }

    this.clearUploadInterval();
    this.processedRows.set(this.totalRows());
    this.uploadProgress.set(100);
    this.lecturerStateService.updateCourseStudents(
      course.id,
      buildLecturerStudents(this.totalRows()),
      `${this.totalRows()} rows processed successfully.`,
    );
    this.stage.set(LECTURER_UPLOAD_STAGE.complete);
  }

  private async resolveRowCount(file: File): Promise<number> {
    if (file.name.toLowerCase().endsWith('.csv')) {
      const rawText = await file.text();
      const nonEmptyRows = rawText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      return Math.max(nonEmptyRows.length - 1, 0);
    }

    return this.course()?.students.length ?? 100;
  }

  private formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes <= 0) {
      return '0 KB';
    }

    const sizeInKb = Math.max(1, Math.round(sizeInBytes / 1024));
    return `${sizeInKb} KB`;
  }
}

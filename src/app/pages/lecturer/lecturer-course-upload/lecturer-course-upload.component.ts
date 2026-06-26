import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PortalContextService } from '../../../services/portal-context.service';
import { ButtonComponent } from '../../../widgets/button/button.component';
import {
  LECTURER_UPLOAD_ACCEPTED_FILE_TYPES,
  LECTURER_UPLOAD_STAGE,
} from '../lecturer.constants';
import { LecturerResultsService } from '../lecturer-results.service';
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
  private readonly lecturerResultsService = inject(LecturerResultsService);
  private readonly portalContextService = inject(PortalContextService);
  private uploadSubscription: Subscription | null = null;

  readonly hasLoaded = this.lecturerStateService.hasLoaded;
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
    const courseId = this.courseId();

    if (!courseId) {
      this.stage.set(LECTURER_UPLOAD_STAGE.fileSelected);
      return;
    }

    const numericCourseId = Number(courseId);

    if (!Number.isFinite(numericCourseId)) {
      this.stage.set(LECTURER_UPLOAD_STAGE.fileSelected);
      return;
    }

    this.uploadSubscription?.unsubscribe();
    this.uploadSubscription = this.lecturerResultsService
      .uploadResultsFile(numericCourseId, this.selectedFile)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const totalBytes = event.total ?? null;

            if (totalBytes && totalBytes > 0) {
              const progress = Math.min(
                99,
                Math.round((event.loaded / totalBytes) * 100),
              );
              this.uploadProgress.set(progress);
              this.processedRows.set(
                Math.min(
                  this.totalRows(),
                  Math.round((progress / 100) * this.totalRows()),
                ),
              );
              return;
            }

            const progress = Math.min(95, this.uploadProgress() + 4);
            this.uploadProgress.set(progress);
            this.processedRows.set(
              Math.min(
                this.totalRows(),
                Math.round((progress / 100) * this.totalRows()),
              ),
            );
            return;
          }

          if (event instanceof HttpResponse) {
            this.completeUpload(event.body ?? null);
          }
        },
        error: () => {
          this.uploadProgress.set(0);
          this.processedRows.set(0);
          this.stage.set(LECTURER_UPLOAD_STAGE.fileSelected);
        },
      });
  }

  downloadTemplate(): void {
    this.lecturerStateService.downloadTemplate();
  }

  goBackToCourse(): void {
    const course = this.course();

    if (!course) {
      this.router.navigateByUrl(`${this.roleBasePath}/my-courses`);
      return;
    }

    this.router.navigate([this.roleBasePath, 'my-courses', course.id]);
  }

  ngOnDestroy(): void {
    this.uploadSubscription?.unsubscribe();
  }

  private completeUpload(response: unknown): void {
    const course = this.course();

    if (!course) {
      return;
    }

    const responseRecord =
      response && typeof response === 'object'
        ? (response as Record<string, unknown>)
        : null;
    const processedRows =
      typeof responseRecord?.['processed_rows'] === 'number'
        ? responseRecord['processed_rows']
        : typeof responseRecord?.['processedRows'] === 'number'
          ? responseRecord['processedRows']
          : null;
    const message =
      typeof responseRecord?.['message'] === 'string'
        ? responseRecord['message']
        : typeof responseRecord?.['detail'] === 'string'
          ? responseRecord['detail']
          : null;

    this.processedRows.set(this.totalRows());
    this.uploadProgress.set(100);
    const successMessage =
      message ??
      `${processedRows ?? this.totalRows()} rows processed successfully.`;
    this.lecturerStateService.updateCourseUploadSummary(
      course.id,
      successMessage,
    );
    this.lecturerStateService.loadCourseResults(course.id);
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

  get roleBasePath(): string {
    return this.portalContextService.getRoleBasePath();
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PaginatorState } from 'primeng/paginator';
import {
  ActionModalPayload,
  ActionNoteModalComponent,
} from '../../../../widgets/action-note-modal/action-note-modal.component';
import { AppPaginationComponent } from '../../../../widgets/app-pagination/app-pagination.component';
import { ButtonComponent } from '../../../../widgets/button/button.component';
import { FilterSelectComponent } from '../../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../../widgets/search-input/search-input.component';
import { StatusIndicatorComponent } from '../../../../widgets/status-indicator/status-indicator.component';
import {
  HOD_FLAG_DOCUMENT_OPTIONS,
  HOD_FLAG_REASON_OPTIONS,
  HOD_PROGRAMME_FILTER_OPTIONS,
} from '../../hod.constants';
import { HodStateService } from '../../hod-state.service';
import { HodProgrammeFilterOption } from '../../hod.types';

type DocumentVerificationTab = 'pending' | 'flagged';

@Component({
  selector: 'app-hod-document-verification',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    FilterSelectComponent,
    ButtonComponent,
    StatusIndicatorComponent,
    AppPaginationComponent,
    ActionNoteModalComponent,
  ],
  templateUrl: './hod-document-verification.component.html',
  styleUrl: './hod-document-verification.component.scss',
})
export class HodDocumentVerificationComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly programmeOptions = HOD_PROGRAMME_FILTER_OPTIONS;
  readonly flagReasonOptions = [...HOD_FLAG_REASON_OPTIONS];
  readonly fallbackFlagDocumentOptions = [...HOD_FLAG_DOCUMENT_OPTIONS];
  readonly activeTab = signal<DocumentVerificationTab>('pending');
  readonly searchTerm = signal('');
  readonly selectedProgramme = signal<HodProgrammeFilterOption>(
    this.programmeOptions[0],
  );
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly activeFlagRecordId = signal<string | null>(null);
  readonly pendingVerificationCount =
    this.hodStateService.pendingDocumentVerificationCount;
  readonly flaggedDocumentCount = this.hodStateService.flaggedDocumentCount;
  readonly isLoading = this.hodStateService.isDocumentVerificationsLoading;

  readonly filteredRecords = computed(() => {
    const activeTab = this.activeTab();
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();
    const selectedProgramme = this.selectedProgramme().value;

    return this.hodStateService
      .documentVerifications()
      .filter((record) =>
        activeTab === 'pending'
          ? record.status === 'pending'
          : record.status === 'flagged',
      )
      .filter((record) =>
        selectedProgramme === 'all'
          ? true
          : record.levelLabel === selectedProgramme,
      )
      .filter((record) => {
        if (!normalizedSearchTerm) {
          return true;
        }

        return (
          record.studentName.toLowerCase().includes(normalizedSearchTerm) ||
          record.registrationNumber.toLowerCase().includes(normalizedSearchTerm)
        );
      });
  });

  readonly paginatedRecords = computed(() => {
    const start = this.first();
    const end = start + this.rows();

    return this.filteredRecords().slice(start, end);
  });

  readonly activeFlagRecord = computed(() => {
    const recordId = this.activeFlagRecordId();

    if (!recordId) {
      return null;
    }

    return (
      this.hodStateService
        .documentVerifications()
        .find((record) => record.id === recordId) ?? null
    );
  });
  readonly flagDocumentOptions = computed(() => {
    const activeFlagRecord = this.activeFlagRecord();

    if (activeFlagRecord === null || activeFlagRecord.documents.length === 0) {
      return this.fallbackFlagDocumentOptions;
    }

    return activeFlagRecord.documents.map((document) => document.name);
  });

  setActiveTab(tab: DocumentVerificationTab): void {
    this.activeTab.set(tab);
    this.first.set(0);
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.first.set(0);
  }

  onProgrammeChange(programme: HodProgrammeFilterOption): void {
    this.selectedProgramme.set(programme);
    this.first.set(0);
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  openFlagModal(recordId: string): void {
    this.activeFlagRecordId.set(recordId);
  }

  closeFlagModal(): void {
    this.activeFlagRecordId.set(null);
  }

  verifyDocuments(recordId: string): void {
    this.hodStateService.verifyDocuments(recordId);
  }

  submitFlagPayload(payload: ActionModalPayload): void {
    const activeFlagRecord = this.activeFlagRecord();

    if (!activeFlagRecord) {
      return;
    }

    this.hodStateService.flagDocuments(activeFlagRecord.id, {
      affectedDocuments: payload.affectedDocuments,
      reason: payload.reason,
      note: payload.note,
    });
    this.closeFlagModal();
    this.setActiveTab('flagged');
  }

  viewDocument(previewUrl: string): void {
    globalThis.open(previewUrl, '_blank', 'noopener,noreferrer');
  }
}

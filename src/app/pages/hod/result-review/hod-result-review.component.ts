import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PaginatorState } from 'primeng/paginator';
import { AppPaginationComponent } from '../../../widgets/app-pagination/app-pagination.component';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { FilterSelectComponent } from '../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import { HOD_PROGRAMME_FILTER_OPTIONS } from '../hod.constants';
import { HodStateService } from '../hod-state.service';
import { HodProgrammeFilterOption, HodResultReviewRecord } from '../hod.types';

type ResultReviewTab = 'pending' | 'approved';

@Component({
  selector: 'app-hod-result-review',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    FilterSelectComponent,
    ButtonComponent,
    AppPaginationComponent,
  ],
  templateUrl: './hod-result-review.component.html',
  styleUrl: './hod-result-review.component.scss',
})
export class HodResultReviewComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly programmeOptions = HOD_PROGRAMME_FILTER_OPTIONS;
  readonly activeTab = signal<ResultReviewTab>('pending');
  readonly searchTerm = signal('');
  readonly selectedProgramme = signal<HodProgrammeFilterOption>(
    this.programmeOptions[0],
  );
  readonly first = signal(0);
  readonly rows = signal(6);
  readonly expandedRecordIds = signal<string[]>([]);
  readonly pendingResultCount = this.hodStateService.pendingResultReviewCount;
  readonly approvedResultCount = this.hodStateService.approvedResultReviewCount;
  readonly totalResultCount = computed(
    () => this.hodStateService.resultReviews().length,
  );

  readonly filteredRecords = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();
    const selectedProgramme = this.selectedProgramme().value;
    const showApprovedRecords = this.activeTab() === 'approved';

    return this.hodStateService
      .resultReviews()
      .filter((record) => record.approved === showApprovedRecords)
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
          record.courseTitle.toLowerCase().includes(normalizedSearchTerm) ||
          record.courseCode.toLowerCase().includes(normalizedSearchTerm) ||
          record.submittedBy.toLowerCase().includes(normalizedSearchTerm)
        );
      });
  });

  readonly paginatedRecords = computed(() => {
    const start = this.first();
    const end = start + this.rows();

    return this.filteredRecords().slice(start, end);
  });

  setActiveTab(tab: ResultReviewTab): void {
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
    this.rows.set(event.rows ?? 6);
  }

  toggleExpandedRecord(recordId: string): void {
    if (!this.isRecordExpanded(recordId)) {
      this.hodStateService.loadResultReviewStudentRows(recordId);
    }
    this.expandedRecordIds.update((currentRecordIds) =>
      currentRecordIds.includes(recordId)
        ? currentRecordIds.filter(
            (currentRecordId) => currentRecordId !== recordId,
          )
        : [...currentRecordIds, recordId],
    );
  }

  isRecordExpanded(recordId: string): boolean {
    return this.expandedRecordIds().includes(recordId);
  }

  approveRecord(recordId: string): void {
    this.hodStateService.approveResultReview(recordId);
  }

  getPassRate(record: HodResultReviewRecord): number {
    return Math.round((record.passedStudents / record.totalStudents) * 100);
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { PaginatorState } from 'primeng/paginator';
import { AppPaginationComponent } from '../../../widgets/app-pagination/app-pagination.component';
import { FilterSelectComponent } from '../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import { HOD_PROGRAMME_FILTER_OPTIONS } from '../hod.constants';
import { HodStateService } from '../hod-state.service';
import {
  HodProgrammeFilterOption,
  HodStudentRecord,
  HodStudentRecordDrawerTab,
} from '../hod.types';
import { StudentRecordDetailsDrawerComponent } from './student-record-details-drawer.component';

@Component({
  selector: 'app-hod-students-record',
  standalone: true,
  imports: [
    CommonModule,
    DrawerModule,
    SearchInputComponent,
    FilterSelectComponent,
    AppPaginationComponent,
    StudentRecordDetailsDrawerComponent,
  ],
  templateUrl: './hod-students-record.component.html',
  styleUrl: './hod-students-record.component.scss',
})
export class HodStudentsRecordComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly programmeOptions = HOD_PROGRAMME_FILTER_OPTIONS;
  readonly searchTerm = signal('');
  readonly selectedProgramme = signal<HodProgrammeFilterOption>(
    this.programmeOptions[0],
  );
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly activeDrawerRecordId = signal<string | null>(null);
  readonly activeDrawerTab =
    signal<HodStudentRecordDrawerTab>('personal_details');
  readonly totalStudentCount = computed(
    () => this.hodStateService.studentRecords().length,
  );
  readonly ondStudentCount = computed(
    () =>
      this.hodStateService
        .studentRecords()
        .filter((record) => record.programmeType === 'OND').length,
  );
  readonly hndStudentCount = computed(
    () =>
      this.hodStateService
        .studentRecords()
        .filter((record) => record.programmeType === 'HND').length,
  );

  readonly filteredRecords = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();
    const selectedProgramme = this.selectedProgramme().value;

    return this.hodStateService
      .studentRecords()
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
          record.matricNumber.toLowerCase().includes(normalizedSearchTerm) ||
          record.emailAddress.toLowerCase().includes(normalizedSearchTerm)
        );
      });
  });

  readonly paginatedRecords = computed(() => {
    const start = this.first();
    const end = start + this.rows();

    return this.filteredRecords().slice(start, end);
  });

  readonly activeStudentRecord = computed(() => {
    const recordId = this.activeDrawerRecordId();

    if (!recordId) {
      return null;
    }

    return this.hodStateService.getStudentRecordById(recordId);
  });

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

  openDrawer(recordId: string): void {
    this.activeDrawerRecordId.set(recordId);
    this.activeDrawerTab.set('personal_details');
  }

  closeDrawer(): void {
    this.activeDrawerRecordId.set(null);
  }

  setActiveDrawerTab(tab: HodStudentRecordDrawerTab): void {
    this.activeDrawerTab.set(tab);
  }

  getCgpaClass(record: HodStudentRecord): string {
    if (record.cgpa >= 3.5) {
      return 'is-high';
    }

    if (record.cgpa >= 3) {
      return 'is-medium';
    }

    return 'is-low';
  }
}

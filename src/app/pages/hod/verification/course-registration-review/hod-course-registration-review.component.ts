import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PaginatorState } from 'primeng/paginator';
import { DrawerModule } from 'primeng/drawer';
import { AppPaginationComponent } from '../../../../widgets/app-pagination/app-pagination.component';
import { FilterSelectComponent } from '../../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../../widgets/search-input/search-input.component';
import {
  StatusIndicatorComponent,
  StatusTone,
} from '../../../../widgets/status-indicator/status-indicator.component';
import { HOD_PROGRAMME_FILTER_OPTIONS } from '../../hod.constants';
import { HodStateService } from '../../hod-state.service';
import {
  HodCourseRegistrationRecord,
  HodProgrammeFilterOption,
} from '../../hod.types';
import { CourseRegistrationReviewDrawerComponent } from './course-registration-review-drawer.component';

type CourseRegistrationTab = 'pending' | 'rejected';

@Component({
  selector: 'app-hod-course-registration-review',
  standalone: true,
  imports: [
    CommonModule,
    DrawerModule,
    SearchInputComponent,
    FilterSelectComponent,
    StatusIndicatorComponent,
    AppPaginationComponent,
    CourseRegistrationReviewDrawerComponent,
  ],
  templateUrl: './hod-course-registration-review.component.html',
  styleUrl: './hod-course-registration-review.component.scss',
})
export class HodCourseRegistrationReviewComponent {
  private readonly hodStateService = inject(HodStateService);

  readonly programmeOptions = HOD_PROGRAMME_FILTER_OPTIONS;
  readonly activeTab = signal<CourseRegistrationTab>('pending');
  readonly searchTerm = signal('');
  readonly selectedProgramme = signal<HodProgrammeFilterOption>(
    this.programmeOptions[0],
  );
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly activeDrawerRecordId = signal<string | null>(null);
  readonly pendingReviewCount =
    this.hodStateService.pendingCourseRegistrationCount;
  readonly rejectedRegistrationCount =
    this.hodStateService.rejectedCourseRegistrationCount;

  readonly filteredRecords = computed(() => {
    const normalizedSearchTerm = this.searchTerm().trim().toLowerCase();
    const activeTab = this.activeTab();
    const selectedProgramme = this.selectedProgramme().value;

    return this.hodStateService
      .courseRegistrations()
      .filter((record) => {
        if (activeTab === 'rejected') {
          return record.status === 'rejected';
        }

        return (
          record.status === 'pending_review' || record.status === 'resubmitted'
        );
      })
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

  readonly activeDrawerRecord = computed(() => {
    const recordId = this.activeDrawerRecordId();

    if (!recordId) {
      return null;
    }

    return this.hodStateService.getCourseRegistrationById(recordId);
  });

  setActiveTab(tab: CourseRegistrationTab): void {
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

  openDrawer(recordId: string): void {
    this.activeDrawerRecordId.set(recordId);
  }

  closeDrawer(): void {
    this.activeDrawerRecordId.set(null);
  }

  approveRecord(recordId: string): void {
    this.hodStateService.approveCourseRegistration(recordId);
    this.closeDrawer();
  }

  rejectRecord(recordId: string): void {
    this.hodStateService.rejectCourseRegistration(recordId);
    this.closeDrawer();
  }

  getStatusText(record: HodCourseRegistrationRecord): string {
    if (record.status === 'pending_review') {
      return 'Pending Review';
    }

    if (record.status === 'resubmitted') {
      return 'Resubmitted';
    }

    if (record.status === 'approved') {
      return 'Approved';
    }

    return 'Rejected';
  }

  getStatusTone(record: HodCourseRegistrationRecord): StatusTone {
    if (record.status === 'pending_review') {
      return 'pending';
    }

    if (record.status === 'resubmitted') {
      return 'resubmitted';
    }

    if (record.status === 'approved') {
      return 'approved';
    }

    return 'rejected';
  }

  isApproveDisabled(record: HodCourseRegistrationRecord): boolean {
    return record.status === 'approved' || record.status === 'rejected';
  }

  isRejectDisabled(record: HodCourseRegistrationRecord): boolean {
    return record.status === 'rejected';
  }
}

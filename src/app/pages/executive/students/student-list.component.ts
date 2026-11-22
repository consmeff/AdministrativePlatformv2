import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
} from 'rxjs';
import { AppPaginationComponent } from '../../../widgets/app-pagination/app-pagination.component';
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import { StatusIndicatorComponent } from '../../../widgets/status-indicator/status-indicator.component';
import { ExecutiveApiService } from '../executive-api.service';
import { StudentDto } from '../executive-api.types';
import { formatDisplayDate, formatNaira } from '../executive.utils';
import {
  SCHOOL_FEE_FILTER_OPTIONS,
  SchoolFeeFilter,
  labelOf,
  schoolFeeTone,
  studentDepartmentLine,
} from './student-list.utils';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/** Every student with their school-fee position for the current session. Read-only. */
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    AppPaginationComponent,
    SearchInputComponent,
    StatusIndicatorComponent,
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  private readonly api = inject(ExecutiveApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly pageSize = PAGE_SIZE;
  readonly feeStatusOptions = SCHOOL_FEE_FILTER_OPTIONS;

  readonly students = signal<StudentDto[]>([]);
  readonly totalRecords = signal(0);
  readonly first = signal(0);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly searchTerm = signal('');
  selectedFeeStatus: SchoolFeeFilter = 'all';

  readonly formatNaira = formatNaira;
  readonly formatDisplayDate = formatDisplayDate;
  readonly schoolFeeTone = schoolFeeTone;
  readonly departmentLine = studentDepartmentLine;
  readonly labelOf = labelOf;

  constructor() {
    this.reload$
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.loadFailed.set(false);
          return this.api
            .getStudents({
              page: Math.floor(this.first() / PAGE_SIZE) + 1,
              search: this.searchTerm().trim(),
              school_fee_status:
                this.selectedFeeStatus === 'all'
                  ? undefined
                  : this.selectedFeeStatus,
            })
            .pipe(
              catchError(() => {
                this.loadFailed.set(true);
                return of(null);
              }),
              finalize(() => this.loading.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.students.set(page?.data ?? []);
        this.totalRecords.set(page?.total ?? 0);
      });

    this.search$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.resetToFirstPage());

    this.reload$.next();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.search$.next(term.trim());
  }

  onFilterChange(): void {
    this.resetToFirstPage();
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.reload$.next();
  }

  private resetToFirstPage(): void {
    this.first.set(0);
    this.reload$.next();
  }
}

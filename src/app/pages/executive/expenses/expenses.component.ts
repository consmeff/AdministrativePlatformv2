import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
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
import { APP_PERMISSIONS } from '../../../constants/permissions.constants';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';
import { NotificationService } from '../../../services/notification.service';
import { AppPaginationComponent } from '../../../widgets/app-pagination/app-pagination.component';
import { ButtonComponent } from '../../../widgets/button/button.component';
import { MetricCardComponent } from '../../../widgets/metric-card/metric-card.component';
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import { ExecutiveApiService } from '../executive-api.service';
import {
  CreateExpensePayload,
  ExpenseDto,
  ExpenseSummaryDto,
} from '../executive-api.types';
import {
  EXPENSE_CATEGORIES,
  formatDisplayDate,
  formatNaira,
} from '../executive.utils';
import { ExpenseFormModalComponent } from './expense-form-modal/expense-form-modal.component';

const PAGE_SIZE = 10;
const ALL_CATEGORIES = '';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    HasPermissionDirective,
    AppPaginationComponent,
    ButtonComponent,
    MetricCardComponent,
    SearchInputComponent,
    ExpenseFormModalComponent,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent {
  private readonly api = inject(ExecutiveApiService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly createPermission = APP_PERMISSIONS.CREATE_EXPENSES;
  readonly pageSize = PAGE_SIZE;
  readonly categoryOptions = [
    { label: 'All Categories', value: ALL_CATEGORIES },
    ...EXPENSE_CATEGORIES.map((category) => ({
      label: category,
      value: category,
    })),
  ];

  readonly expenses = signal<ExpenseDto[]>([]);
  readonly totalRecords = signal(0);
  readonly first = signal(0);
  readonly loading = signal(true);
  readonly summary = signal<ExpenseSummaryDto | null>(null);
  readonly searchTerm = signal('');
  selectedCategory = ALL_CATEGORIES;

  readonly formVisible = signal(false);
  readonly saving = signal(false);

  readonly summaryCards = computed(() => {
    const summary = this.summary();
    return [
      {
        title: 'Total Expenses',
        value: summary ? formatNaira(summary.total_expenses) : '—',
        subtext: summary
          ? `${summary.total_count.toLocaleString()} records`
          : '',
      },
      {
        title: 'This Month',
        value: summary ? formatNaira(summary.this_month_total) : '—',
        subtext: '',
      },
    ];
  });

  readonly formatNaira = formatNaira;
  readonly formatDisplayDate = formatDisplayDate;

  constructor() {
    this.reload$
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.api
            .getExpenses({
              page: Math.floor(this.first() / PAGE_SIZE) + 1,
              search: this.searchTerm().trim(),
              category: this.selectedCategory,
              ordering: '-expense_date',
            })
            .pipe(
              catchError(() => of(null)),
              finalize(() => this.loading.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.expenses.set(page?.data ?? []);
        this.totalRecords.set(page?.total ?? 0);
      });

    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.resetToFirstPage());

    this.loadSummary();
    this.reload$.next();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.search$.next(term.trim());
  }

  onCategoryChange(): void {
    this.resetToFirstPage();
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.reload$.next();
  }

  openForm(): void {
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.formVisible.set(false);
  }

  saveExpense(payload: CreateExpensePayload): void {
    this.saving.set(true);
    this.api
      .createExpense(payload)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notification.success('Expense recorded.');
          this.formVisible.set(false);
          this.loadSummary();
          this.resetToFirstPage();
        },
        // The error interceptor already shows the failure; keep the form
        // open so nothing typed is lost.
        error: () => undefined,
      });
  }

  private resetToFirstPage(): void {
    this.first.set(0);
    this.reload$.next();
  }

  private loadSummary(): void {
    this.api
      .getExpenseSummary()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((summary) => this.summary.set(summary));
  }
}

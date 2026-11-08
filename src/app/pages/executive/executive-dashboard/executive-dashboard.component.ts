import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import {
  EXPENSE_VIEW_PERMISSIONS,
  INCOME_VIEW_PERMISSIONS,
} from '../../../constants/permissions.constants';
import { PaymentService } from '../../../services/payment.service';
import { PermissionService } from '../../../services/permission.service';
import { PortalContextService } from '../../../services/portal-context.service';
import { MetricCardComponent } from '../../../widgets/metric-card/metric-card.component';
import { PaymentDashboardDto } from '../../payment-record/payment-record.types';
import { ExecutiveApiService } from '../executive-api.service';
import {
  ExpenseDto,
  ExpenseSummaryDto,
  StudentSummaryDto,
} from '../executive-api.types';
import { formatDisplayDate, formatNaira, toAmount } from '../executive.utils';

interface DashboardCard {
  title: string;
  value: string;
  subtext: string;
}

const RECENT_EXPENSE_COUNT = 5;

/** Landing page for both the Board and Provost portals. */
@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MetricCardComponent],
  templateUrl: './executive-dashboard.component.html',
  styleUrl: './executive-dashboard.component.scss',
})
export class ExecutiveDashboardComponent {
  private readonly api = inject(ExecutiveApiService);
  private readonly paymentService = inject(PaymentService);
  private readonly permissionService = inject(PermissionService);
  private readonly portalContextService = inject(PortalContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly basePath = this.portalContextService.getRoleBasePath();
  readonly canViewIncome = this.permissionService.hasAny(
    INCOME_VIEW_PERMISSIONS,
  );
  readonly canViewExpenses = this.permissionService.hasAny(
    EXPENSE_VIEW_PERMISSIONS,
  );

  readonly loading = signal(true);
  readonly students = signal<StudentSummaryDto | null>(null);
  readonly income = signal<PaymentDashboardDto | null>(null);
  readonly expenseSummary = signal<ExpenseSummaryDto | null>(null);
  readonly recentExpenses = signal<ExpenseDto[]>([]);

  readonly cards = computed<DashboardCard[]>(() => {
    const students = this.students();
    const income = this.income();
    const expenses = this.expenseSummary();

    const cards: DashboardCard[] = [
      {
        title: 'Total Students',
        value: students ? students.total_students.toLocaleString() : '—',
        subtext: 'Currently enrolled',
      },
    ];

    if (this.canViewIncome) {
      cards.push({
        title: 'Total Income',
        value: income ? formatNaira(income.total_revenue) : '—',
        subtext: income
          ? `${income.total_transactions.toLocaleString()} transactions`
          : '',
      });
    }

    if (this.canViewExpenses) {
      cards.push({
        title: 'Total Expenses',
        value: expenses ? formatNaira(expenses.total_expenses) : '—',
        subtext: expenses
          ? `${formatNaira(expenses.this_month_total)} this month`
          : '',
      });
    }

    if (this.canViewIncome && this.canViewExpenses) {
      const net =
        income && expenses
          ? formatNaira(
              toAmount(income.total_revenue) -
                toAmount(expenses.total_expenses),
            )
          : '—';
      cards.push({
        title: 'Net Position',
        value: net,
        subtext: 'Income less expenses',
      });
    }

    return cards;
  });

  readonly programmeBreakdown = computed(
    () => this.students()?.by_programme ?? [],
  );

  readonly formatNaira = formatNaira;
  readonly formatDisplayDate = formatDisplayDate;

  constructor() {
    this.load();
  }

  private load(): void {
    // Each source fails on its own: a missing endpoint shouldn't blank out
    // the cards that did load.
    forkJoin({
      students: orNull(this.api.getStudentSummary()),
      income: this.canViewIncome
        ? orNull(this.paymentService.getPaymentDashboard())
        : of(null),
      expenseSummary: this.canViewExpenses
        ? orNull(this.api.getExpenseSummary())
        : of(null),
      recentExpenses: this.canViewExpenses
        ? orNull(this.api.getExpenses({ ordering: '-expense_date' })).pipe(
            map((page) => page?.data.slice(0, RECENT_EXPENSE_COUNT) ?? []),
          )
        : of([]),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.students.set(result.students);
        this.income.set(result.income);
        this.expenseSummary.set(result.expenseSummary);
        this.recentExpenses.set(result.recentExpenses);
        this.loading.set(false);
      });
  }
}

function orNull<T>(source: Observable<T>): Observable<T | null> {
  return source.pipe(catchError(() => of(null)));
}

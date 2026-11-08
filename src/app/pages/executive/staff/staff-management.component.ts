import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
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
import { SearchInputComponent } from '../../../widgets/search-input/search-input.component';
import { StatusIndicatorComponent } from '../../../widgets/status-indicator/status-indicator.component';
import { ExecutiveApiService } from '../executive-api.service';
import { StaffDto, StaffPayload } from '../executive-api.types';
import { STAFF_TYPES, formatDisplayDate } from '../executive.utils';
import { StaffFormModalComponent } from './staff-form-modal/staff-form-modal.component';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    DialogModule,
    HasPermissionDirective,
    AppPaginationComponent,
    ButtonComponent,
    SearchInputComponent,
    StatusIndicatorComponent,
    StaffFormModalComponent,
  ],
  templateUrl: './staff-management.component.html',
  styleUrl: './staff-management.component.scss',
})
export class StaffManagementComponent {
  private readonly api = inject(ExecutiveApiService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly permissions = {
    create: APP_PERMISSIONS.CREATE_USERS,
    update: APP_PERMISSIONS.UPDATE_USERS,
    activate: APP_PERMISSIONS.ACTIVATE_USER_ACCOUNT,
  };
  readonly pageSize = PAGE_SIZE;
  readonly staffTypeOptions = [
    { label: 'All Roles', value: '' },
    ...STAFF_TYPES.map((type) => ({ label: type, value: type })),
  ];
  readonly statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  readonly staff = signal<StaffDto[]>([]);
  readonly totalRecords = signal(0);
  readonly first = signal(0);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  selectedStaffType = '';
  selectedStatus: StatusFilter = 'all';

  readonly formVisible = signal(false);
  readonly editingStaff = signal<StaffDto | null>(null);
  readonly saving = signal(false);

  /** Staff member awaiting confirmation of an activate/deactivate. */
  readonly statusTarget = signal<StaffDto | null>(null);
  readonly statusSaving = signal(false);

  readonly formatDisplayDate = formatDisplayDate;

  constructor() {
    this.reload$
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          return this.api
            .getStaff({
              page: Math.floor(this.first() / PAGE_SIZE) + 1,
              search: this.searchTerm().trim(),
              staff_type: this.selectedStaffType,
              is_active:
                this.selectedStatus === 'all'
                  ? undefined
                  : this.selectedStatus === 'active',
            })
            .pipe(
              catchError(() => of(null)),
              finalize(() => this.loading.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.staff.set(page?.data ?? []);
        this.totalRecords.set(page?.total ?? 0);
      });

    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.resetToFirstPage());

    this.reload$.next();
  }

  fullName(member: StaffDto): string {
    return [member.first_name, member.other_names, member.last_name]
      .filter((part) => !!part?.trim())
      .join(' ');
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

  openCreate(): void {
    this.editingStaff.set(null);
    this.formVisible.set(true);
  }

  openEdit(member: StaffDto): void {
    this.editingStaff.set(member);
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.formVisible.set(false);
  }

  saveStaff(payload: StaffPayload): void {
    const editing = this.editingStaff();
    const request = editing
      ? this.api.updateStaff(editing.id, payload)
      : this.api.createStaff(payload);

    this.saving.set(true);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notification.success(
            editing ? 'Staff details updated.' : 'Staff member added.',
          );
          this.formVisible.set(false);
          if (editing) {
            this.reload$.next();
          } else {
            this.resetToFirstPage();
          }
        },
        // The error interceptor already reports it; keep the form open.
        error: () => undefined,
      });
  }

  askToggleStatus(member: StaffDto): void {
    this.statusTarget.set(member);
  }

  cancelToggleStatus(): void {
    if (!this.statusSaving()) {
      this.statusTarget.set(null);
    }
  }

  confirmToggleStatus(): void {
    const member = this.statusTarget();
    if (!member || this.statusSaving()) {
      return;
    }

    const activate = !member.is_active;
    this.statusSaving.set(true);
    this.api
      .setStaffActive(member.id, activate)
      .pipe(
        finalize(() => this.statusSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notification.success(
            `${this.fullName(member)} ${activate ? 'activated' : 'deactivated'}.`,
          );
          this.statusTarget.set(null);
          this.reload$.next();
        },
        error: () => undefined,
      });
  }

  private resetToFirstPage(): void {
    this.first.set(0);
    this.reload$.next();
  }
}

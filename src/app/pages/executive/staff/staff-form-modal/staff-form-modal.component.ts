import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonComponent } from '../../../../widgets/button/button.component';
import { StaffDto, StaffPayload } from '../../executive-api.types';
import { STAFF_TYPES } from '../../executive.utils';

/**
 * Keeps a role the backend returned even if it isn't one of our presets,
 * so editing such a record doesn't silently blank its role.
 */
function buildStaffTypeOptions(current: string | null) {
  const types: string[] = [...STAFF_TYPES];
  if (current && !types.includes(current)) {
    types.push(current);
  }
  return types.map((type) => ({ label: type, value: type }));
}

/** Creates a staff member when `staff` is null, edits it otherwise. */
@Component({
  selector: 'app-staff-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    ButtonComponent,
  ],
  templateUrl: './staff-form-modal.component.html',
  styleUrl: './staff-form-modal.component.scss',
})
export class StaffFormModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() loading = false;
  @Input() staff: StaffDto | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<StaffPayload>();

  staffTypeOptions = buildStaffTypeOptions(null);

  readonly form = new FormGroup({
    first_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    last_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    other_names: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(80)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone_number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\+?[0-9\s-]{7,20}$/)],
    }),
    staff_type: new FormControl<string | null>(null, Validators.required),
  });

  get isEdit(): boolean {
    return this.staff !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue !== true) {
      return;
    }
    const staff = this.staff;
    this.staffTypeOptions = buildStaffTypeOptions(staff?.staff_type ?? null);
    this.form.reset({
      first_name: staff?.first_name ?? '',
      last_name: staff?.last_name ?? '',
      other_names: staff?.other_names ?? '',
      email: staff?.email ?? '',
      phone_number: staff?.phone_number ?? '',
      staff_type: staff?.staff_type ?? null,
    });
  }

  showError(name: keyof StaffFormModalComponent['form']['controls']): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  onClose(): void {
    if (this.loading) {
      return;
    }
    this.closed.emit();
  }

  onSave(): void {
    if (this.loading) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const otherNames = value.other_names.trim();
    const phone = value.phone_number.trim();
    this.saved.emit({
      first_name: value.first_name.trim(),
      last_name: value.last_name.trim(),
      email: value.email.trim().toLowerCase(),
      staff_type: value.staff_type!,
      ...(otherNames ? { other_names: otherNames } : {}),
      ...(phone ? { phone_number: phone } : {}),
    });
  }
}

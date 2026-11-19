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
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonComponent } from '../../../../widgets/button/button.component';
import { CreateExpensePayload } from '../../executive-api.types';
import { EXPENSE_CATEGORIES, todayIsoDate } from '../../executive.utils';

/** Expenses are records of money already spent, so no future dates. */
function notInFuture(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  return value && value > todayIsoDate() ? { future: true } : null;
}

@Component({
  selector: 'app-expense-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    ButtonComponent,
  ],
  templateUrl: './expense-form-modal.component.html',
  styleUrl: './expense-form-modal.component.scss',
})
export class ExpenseFormModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CreateExpensePayload>();

  readonly categoryOptions = EXPENSE_CATEGORIES.map((category) => ({
    label: category,
    value: category,
  }));
  readonly maxDate = todayIsoDate();

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    category: new FormControl<string | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    expense_date: new FormControl(todayIsoDate(), {
      nonNullable: true,
      validators: [Validators.required, notInFuture],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.form.reset({ expense_date: todayIsoDate() });
    }
  }

  showError(
    name: keyof ExpenseFormModalComponent['form']['controls'],
  ): boolean {
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
    const description = value.description.trim();
    this.saved.emit({
      title: value.title.trim(),
      category: value.category!,
      amount: value.amount!,
      expense_date: value.expense_date,
      ...(description ? { description } : {}),
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-new-password-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './new-password-form.component.html',
  styleUrl: './new-password-form.component.scss',
})
export class NewPasswordFormComponent {
  @Input() loading = false;
  @Input() buttonLabel = 'Reset Password';
  @Output() submitPassword = new EventEmitter<{
    password: string;
    confirmPassword: string;
  }>();
  private readonly fb = inject(FormBuilder);
  form = this.fb.group(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.hasUpperCase(),
        this.hasLowerCase(),
        this.hasDigit(),
        this.hasSpecialCharacter(),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator('password', 'confirmPassword') },
  );

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitPassword.emit({
      password: this.form.controls['password'].value as string,
      confirmPassword: this.form.controls['confirmPassword'].value as string,
    });
  }

  get passwordChecks() {
    const value = (this.form.controls['password'].value as string) || '';
    return {
      minLength: value.length >= 8,
      special: /[^A-Za-z0-9]/.test(value),
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      digit: /[0-9]/.test(value),
    };
  }

  private passwordMatchValidator(
    passwordKey: string,
    confirmPasswordKey: string,
  ): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey)?.value;
      const confirmPassword = group.get(confirmPasswordKey)?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  private hasUpperCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value as string) || '';
      return /[A-Z]/.test(value) ? null : { noUpperCase: true };
    };
  }

  private hasLowerCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value as string) || '';
      return /[a-z]/.test(value) ? null : { noLowerCase: true };
    };
  }

  private hasDigit(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value as string) || '';
      return /[0-9]/.test(value) ? null : { noDigit: true };
    };
  }

  private hasSpecialCharacter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value as string) || '';
      return /[^A-Za-z0-9]/.test(value) ? null : { noSpecialCharacter: true };
    };
  }
}

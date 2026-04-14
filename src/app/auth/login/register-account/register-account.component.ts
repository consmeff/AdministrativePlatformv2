import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { OtpInputComponent } from '../shared/otp-input/otp-input.component';

type RegisterView = 'form' | 'otp';

@Component({
  selector: 'app-register-account',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    OtpInputComponent,
  ],
  templateUrl: './register-account.component.html',
  styleUrl: './register-account.component.scss',
})
export class RegisterAccountComponent implements OnInit {
  view: RegisterView = 'form';
  registerEmail = '';
  creatingAccount = false;
  verifyingRegisterOtp = false;
  registerOtpDigits = ['', '', '', '', '', ''];
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  registerForm = this.fb.group(
    {
      first_name: new FormControl('', [Validators.required]),
      other_names: new FormControl(''),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.hasUpperCase(),
        this.hasLowerCase(),
        this.hasDigit(),
        this.hasSpecialCharacter(),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      phone_number: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10,15}$/),
      ]),
      alt_phone_number: new FormControl('', [
        Validators.pattern(/^[0-9]{10,15}$/),
      ]),
    },
    { validators: this.passwordMatchValidator('password', 'confirmPassword') },
  );

  ngOnInit(): void {
    this.view = this.router.url.endsWith('/otp') ? 'otp' : 'form';
    this.registerEmail = sessionStorage.getItem('profile_email') ?? '';
  }

  createAccount() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      return;
    }
    this.creatingAccount = true;
    const payload = {
      first_name: this.registerForm.controls['first_name'].value as string,
      other_names:
        (this.registerForm.controls['other_names'].value as string) || '',
      last_name: this.registerForm.controls['last_name'].value as string,
      email: this.registerForm.controls['email'].value as string,
      phone_number: this.registerForm.controls['phone_number'].value as string,
      alt_phone_number:
        (this.registerForm.controls['alt_phone_number'].value as string) || '',
      password: this.registerForm.controls['password'].value as string,
    };
    this.authService.create(payload).subscribe({
      next: (response) => {
        this.registerEmail = response.email ?? payload.email;
        sessionStorage.setItem('profile_email', this.registerEmail);
        this.registerOtpDigits = ['', '', '', '', '', ''];
        this.view = 'otp';
        this.router.navigateByUrl('/auth/register/otp');
        this.toast.success('Create Account', 'OTP sent to your email');
        this.creatingAccount = false;
      },
      error: (err) => {
        this.toast.error(
          'Create Account',
          this.extractErrorMessage(err, 'Unable to create account'),
        );
        this.creatingAccount = false;
      },
    });
  }

  verifyRegistrationOtp() {
    const otp = this.registerOtpDigits.join('');
    if (otp.length !== 6) {
      this.toast.error('OTP', 'Enter the 6-digit OTP code');
      return;
    }
    if (!this.registerEmail) {
      this.toast.error('OTP', 'Missing registration email');
      return;
    }
    this.verifyingRegisterOtp = true;
    this.authService
      .verifyOtp({
        email: this.registerEmail,
        otp,
      })
      .subscribe((isValid) => {
        if (isValid) {
          this.toast.success('Create Account', 'Account verified successfully');
          this.router.navigateByUrl('/auth/login');
        } else {
          this.toast.error('OTP', 'Invalid OTP code');
        }
        this.verifyingRegisterOtp = false;
      });
  }

  goToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  backToRegistration() {
    this.view = 'form';
    this.router.navigateByUrl('/auth/register');
  }

  get registerPasswordChecks() {
    const value =
      (this.registerForm.controls['password'].value as string) || '';
    return {
      minLength: value.length >= 8,
      special: /[^A-Za-z0-9]/.test(value),
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      digit: /[0-9]/.test(value),
    };
  }

  private extractErrorMessage(err: unknown, fallback: string) {
    const response = err as {
      error?: {
        message?: string;
        non_field_errors?: string[];
        errors?: Record<string, string[]>;
      };
    };
    if (response?.error?.errors) {
      const firstKey = Object.keys(response.error.errors)[0];
      if (firstKey) {
        const firstError = response.error.errors[firstKey]?.[0];
        if (firstError) {
          return firstError;
        }
      }
    }
    if (response?.error?.non_field_errors?.length) {
      return response.error.non_field_errors[0];
    }
    return response?.error?.message ?? fallback;
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

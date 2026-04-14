import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  logginIn = false;
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly spinner = inject(NgxSpinnerService);

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }
    this.logginIn = true;
    this.spinner.show();
    const payload = {
      username: this.loginForm.controls['email'].value as string,
      password: this.loginForm.controls['password'].value as string,
    };
    this.authService.login(payload).subscribe({
      next: (loggedIn) => {
        if (loggedIn) {
          this.toast.success('Login', 'Login successful');
          this.router.navigateByUrl('/pages/dashboard');
        } else {
          this.toast.error('Login', 'Unable to login');
        }
        this.spinner.hide();
        this.logginIn = false;
      },
      error: (err) => {
        this.toast.error(
          'Login',
          this.extractErrorMessage(err, 'Login failed'),
        );
        this.spinner.hide();
        this.logginIn = false;
      },
    });
  }

  goToForgotPassword() {
    this.router.navigateByUrl('/auth/forgot-password');
  }

  goToCreateAccount() {
    this.router.navigateByUrl('/auth/register');
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
}

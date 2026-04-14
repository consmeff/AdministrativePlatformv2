import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { AppModalComponent } from '../../../shared/components/app-modal/app-modal.component';
import { NewPasswordFormComponent } from '../shared/new-password-form/new-password-form.component';
import { OtpInputComponent } from '../shared/otp-input/otp-input.component';

type ForgotView = 'email' | 'otp' | 'reset';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    OtpInputComponent,
    NewPasswordFormComponent,
    AppModalComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  view: ForgotView = 'email';
  resetEmail = '';
  resetOtpDigits = ['', '', '', '', '', ''];
  submittingForgot = false;
  submittingReset = false;
  showResetSuccessModal = false;
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  forgotForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  ngOnInit(): void {
    this.resetEmail = sessionStorage.getItem('forgot_email') ?? '';
    const otp = sessionStorage.getItem('forgot_otp') ?? '';
    if (otp.length === 6) {
      this.resetOtpDigits = otp.split('').slice(0, 6);
    }

    if (this.router.url.endsWith('/otp')) {
      this.view = 'otp';
      return;
    }

    if (this.router.url.endsWith('/reset')) {
      this.view = 'reset';
      return;
    }

    this.view = 'email';
  }

  sendForgotOtp() {
    this.forgotForm.markAllAsTouched();
    if (this.forgotForm.invalid) {
      return;
    }
    this.submittingForgot = true;
    this.resetEmail = this.forgotForm.controls['email'].value as string;
    this.authService
      .verifyEmail({
        email: this.resetEmail,
      })
      .subscribe((sent) => {
        if (sent) {
          this.view = 'otp';
          sessionStorage.setItem('forgot_email', this.resetEmail);
          this.resetOtpDigits = ['', '', '', '', '', ''];
          sessionStorage.removeItem('forgot_otp');
          this.router.navigateByUrl('/auth/forgot-password/otp');
          this.toast.success('Forgot Password', 'OTP sent to your email');
        } else {
          this.toast.error('Forgot Password', 'Unable to send OTP');
        }
        this.submittingForgot = false;
      });
  }

  proceedToCreatePassword() {
    const otp = this.resetOtpDigits.join('');
    if (otp.length !== 6) {
      this.toast.error('OTP', 'Enter the 6-digit OTP code');
      return;
    }
    sessionStorage.setItem('forgot_otp', otp);
    this.view = 'reset';
    this.router.navigateByUrl('/auth/forgot-password/reset');
  }

  resetPassword(values: { password: string; confirmPassword: string }) {
    const otp = this.resetOtpDigits.join('');
    if (otp.length !== 6 || !this.resetEmail) {
      this.toast.error('Reset Password', 'Missing OTP or email');
      return;
    }
    this.submittingReset = true;
    this.authService
      .updatePassword({
        email: this.resetEmail,
        otp,
        password: values.password,
        confirm_password: values.confirmPassword,
      })
      .subscribe((updated) => {
        if (updated) {
          this.showResetSuccessModal = true;
          this.toast.success('Reset Password', 'Password updated successfully');
          sessionStorage.removeItem('forgot_otp');
        } else {
          this.toast.error('Reset Password', 'Unable to reset password');
        }
        this.submittingReset = false;
      });
  }

  closeSuccessModal() {
    this.showResetSuccessModal = false;
    this.router.navigateByUrl('/auth/login');
  }

  backToOtp() {
    if (this.view === 'reset') {
      this.view = 'otp';
      this.router.navigateByUrl('/auth/forgot-password/otp');
      return;
    }
    this.view = 'email';
    this.router.navigateByUrl('/auth/forgot-password');
  }

  goToLogin() {
    this.router.navigateByUrl('/auth/login');
  }
}

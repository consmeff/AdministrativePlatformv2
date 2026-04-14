import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/login/register-account/register-account.component').then(
        (m) => m.RegisterAccountComponent,
      ),
  },
  {
    path: 'auth/register/otp',
    loadComponent: () =>
      import('./auth/login/register-account/register-account.component').then(
        (m) => m.RegisterAccountComponent,
      ),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./auth/login/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'auth/forgot-password/otp',
    loadComponent: () =>
      import('./auth/login/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'auth/forgot-password/reset',
    loadComponent: () =>
      import('./auth/login/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'pages/dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'pages/admissions',
    loadComponent: () =>
      import('./pages/admissions/admissions.component').then(
        (m) => m.AdmissionsComponent,
      ),
  },
  {
    path: 'pages/applicants',
    loadComponent: () =>
      import('./pages/applicants/applicants.component').then(
        (m) => m.ApplicantsComponent,
      ),
    children: [
      { path: '', redirectTo: 'applicantlist', pathMatch: 'full' },
      {
        path: 'applicantlist',
        loadComponent: () =>
          import('./pages/applicants/applicantlists/applicantlists.component').then(
            (m) => m.ApplicantlistsComponent,
          ),
      },
      {
        path: 'applicantdetail/:appno',
        loadComponent: () =>
          import('./pages/applicants/applicantdetail/applicantdetail.component').then(
            (m) => m.ApplicantdetailComponent,
          ),
      },
    ],
  },
];

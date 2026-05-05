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
    path: 'pages',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'admissions',
        loadComponent: () =>
          import('./pages/admissions/admissions.component').then(
            (m) => m.AdmissionsComponent,
          ),
      },
      {
        path: 'payment-records',
        loadComponent: () =>
          import('./pages/payment-record/payment-record.component').then(
            (m) => m.PaymentRecordComponent,
          ),
      },
      {
        path: 'exam-management',
        redirectTo: 'payment-records',
        pathMatch: 'full',
      },
      {
        path: 'applicants',
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
    ],
  },
];

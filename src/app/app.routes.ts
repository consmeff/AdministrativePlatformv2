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
        path: 'hod',
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-dashboard/lecturer-dashboard.component').then(
                (m) => m.LecturerDashboardComponent,
              ),
          },
          {
            path: 'my-courses',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-my-courses/lecturer-my-courses.component').then(
                (m) => m.LecturerMyCoursesComponent,
              ),
          },
          {
            path: 'my-courses/:courseId',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-course-details/lecturer-course-details.component').then(
                (m) => m.LecturerCourseDetailsComponent,
              ),
          },
          {
            path: 'my-courses/:courseId/upload',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-course-upload/lecturer-course-upload.component').then(
                (m) => m.LecturerCourseUploadComponent,
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-profile/lecturer-profile.component').then(
                (m) => m.LecturerProfileComponent,
              ),
          },
          {
            path: 'overview',
            loadComponent: () =>
              import('./pages/hod/hod-overview/hod-overview.component').then(
                (m) => m.HodOverviewComponent,
              ),
          },
          {
            path: 'verification/course-reg',
            loadComponent: () =>
              import('./pages/hod/verification/course-registration-review/hod-course-registration-review.component').then(
                (m) => m.HodCourseRegistrationReviewComponent,
              ),
          },
          {
            path: 'verification/documents',
            loadComponent: () =>
              import('./pages/hod/verification/document-verification/hod-document-verification.component').then(
                (m) => m.HodDocumentVerificationComponent,
              ),
          },
          {
            path: 'result-review',
            loadComponent: () =>
              import('./pages/hod/result-review/hod-result-review.component').then(
                (m) => m.HodResultReviewComponent,
              ),
          },
          {
            path: 'students-record',
            loadComponent: () =>
              import('./pages/hod/students-record/hod-students-record.component').then(
                (m) => m.HodStudentsRecordComponent,
              ),
          },
          {
            path: 'lecturers',
            loadComponent: () =>
              import('./pages/hod/lecturers/hod-lecturers.component').then(
                (m) => m.HodLecturersComponent,
              ),
          },
          {
            path: 'lecturers/assign-courses',
            loadComponent: () =>
              import('./pages/hod/lecturers/assign-courses/hod-assign-courses.component').then(
                (m) => m.HodAssignCoursesComponent,
              ),
          },
          {
            path: 'courses',
            loadComponent: () =>
              import('./pages/hod/courses/hod-courses.component').then(
                (m) => m.HodCoursesComponent,
              ),
          },
          {
            path: 'courses/setup',
            loadComponent: () =>
              import('./pages/hod/courses/setup/hod-course-setup.component').then(
                (m) => m.HodCourseSetupComponent,
              ),
          },
        ],
      },
      {
        path: 'lecturer',
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-dashboard/lecturer-dashboard.component').then(
                (m) => m.LecturerDashboardComponent,
              ),
          },
          {
            path: 'my-courses',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-my-courses/lecturer-my-courses.component').then(
                (m) => m.LecturerMyCoursesComponent,
              ),
          },
          {
            path: 'my-courses/:courseId',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-course-details/lecturer-course-details.component').then(
                (m) => m.LecturerCourseDetailsComponent,
              ),
          },
          {
            path: 'my-courses/:courseId/upload',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-course-upload/lecturer-course-upload.component').then(
                (m) => m.LecturerCourseUploadComponent,
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./pages/lecturer/lecturer-profile/lecturer-profile.component').then(
                (m) => m.LecturerProfileComponent,
              ),
          },
        ],
      },
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

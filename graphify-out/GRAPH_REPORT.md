# Graph Report - AdministrativePlatformv2 (2026-08-04)

## Corpus Check

- 133 files · ~88,334 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1481 nodes · 2716 edges · 118 communities (62 shown, 56 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `03ae70f6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- AdmissionsComponent
- PaymentRecordComponent
- ApplicantdetailComponent
- HodStateService
- HodCourseRegistrationReviewService
- hod.constants.ts
- ApplicantlistsComponent
- devDependencies
- HodAssignCoursesComponent
- SidebarComponent
- applicant.ts
- http.interceptor.ts
- HodDocumentVerificationService
- HodResultReviewService
- AuthService
- hod-document-verification.component.ts
- hod.types.ts
- application.service.ts
- lecturer-state.service.ts
- TopbarComponent
- HodCourseSetupComponent
- LecturerStateService
- ApplicationService
- DashboardComponent
- applicantlists.component.ts
- AdmissionsUploadFlowComponent
- dashboard.component.ts
- hod-students-record.component.ts
- hod-assign-courses.component.ts
- PortalContextService
- lecturer-results.service.ts
- ButtonComponent
- dependencies
- LecturerCourseDetailsComponent
- hod-state.service.ts
- LecturerCourseUploadComponent
- options
- NotificationService
- LecturerCourseAssignmentService
- Applicant Detail View
- HodDocumentVerificationComponent
- UpdateFileModalComponent
- architect
- PermissionService
- auth.service.ts
- SetCutoffModalComponent
- ApplicantExportModalComponent
- development
- scripts
- applicantdetail.component.ts
- production
- package.json
- consmmefadmin
- angular.json
- eslint.config.js
- sidebar.component.ts
- BusyIndicatorComponent
- styles
- HtmliconComponent
- ApplicantsComponent
- lecturer-course-details.component.ts
- App Root Shell Template
- HodModulePlaceholderComponent
- StatusIndicatorComponent Template
- SidebarComponent Template
- @angular/cdk
- @angular/common
- @angular/compiler
- topbar.component.ts
- @angular/forms
- DoughnutComponent
- @angular/platform-browser-dynamic
- CI Quality Job
- @ngrx/signals
- ngx-spinner
- primeng
- @primeng/themes
- rxjs
- tslib
- zone.js
- ButtonComponent Template (app-button)
- FilterSelectComponent Template
- environment.development.ts
- environment.production.ts
- Background Image (Institutional Building Photo)
- Arrow Right Icon
- Capa 1 Dashboard Icon
- Export Icon (export1.png)
- Dashboard Layer 1 Icon
- Layer_2 Dashboard Icon Asset
- Layer_3 Dashboard Icon (Cancel/Error Mark)
- Search Icon (Dashboard)
- Document Icon (doc.png)
- College of Nursing Sciences Logo
- SB Logo (School/Institution Crest)
- Status Logo Icon
- HOD Dashboard Page
- HOD Module Placeholder Page
- HOD Department Overview Page
- LECTURER_GRADE_SCALE
- DoughnutComponent Template
- HtmliconComponent Template
- ReusableTableComponent Template
- Background Image (Institution Building Photo)
- Document Icon (doc.png)
- College of Nursing Sciences Logo
- sblogo.png (School/Institution Crest Logo)
- Status Checkmark Icon (statuslogo.png)
- index.html (App Root Document)
- ActionModalPayload
- HasPermissionDirective
- admissions.component.ts
- .exportApplicantsList
- @angular/core
- chart.js

## God Nodes (most connected - your core abstractions)

1. `AdmissionsComponent` - 76 edges
2. `ApplicantdetailComponent` - 63 edges
3. `ApplicantlistsComponent` - 54 edges
4. `HodStateService` - 52 edges
5. `PaymentRecordComponent` - 36 edges
6. `LecturerStateService` - 29 edges
7. `ApplicationService` - 29 edges
8. `DashboardComponent` - 28 edges
9. `AuthService` - 28 edges
10. `ButtonComponent` - 27 edges

## Surprising Connections (you probably didn't know these)

- `Consmmefadmin Project README` --conceptually_related_to--> `CI Quality Job` [INFERRED]
  README.md → .github/workflows/ci.yml
- `SidebarMenuItem` --references--> `AppPermission` [EXTRACTED]
  src/app/widgets/sidebar/sidebar.component.ts → src/app/constants/permissions.constants.ts
- `Change Programme Modal` --semantically_similar_to--> `Set Cutoff Modal` [INFERRED] [semantically similar]
  src/app/pages/admissions/change-programme-modal/change-programme-modal.component.html → src/app/pages/admissions/set-cutoff-modal/set-cutoff-modal.component.html
- `Admissions Upload Flow (CBT Wizard)` --semantically_similar_to--> `HOD Course Setup Wizard` [INFERRED] [semantically similar]
  src/app/pages/admissions/upload-flow/admissions-upload-flow.component.html → src/app/pages/hod/courses/setup/hod-course-setup.component.html
- `BusyIndicatorComponent Template` --semantically_similar_to--> `StatusIndicatorComponent Template` [INFERRED] [semantically similar]
  src/app/widgets/busy-indicator/busy-indicator.component.html → src/app/widgets/status-indicator/status-indicator.component.html

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Shared Applicant Table & Row-Actions Pattern** — src_app_pages_admissions_admissions_component_admissionspage, src_app_pages_applicants_applicantlists_applicantlists_component_applicantlistpage, src_app_pages_dashboard_dashboard_component_dashboardpage [INFERRED 0.85]
- **Embedded Applicant Detail Drawer Pattern** — src_app_pages_admissions_admissions_component_admissionspage, src_app_pages_applicants_applicantlists_applicantlists_component_applicantlistpage, src_app_pages_dashboard_dashboard_component_dashboardpage [INFERRED 0.85]
- **Compliance / Rejection Reason Modal Flow** — src_app_pages_applicants_applicantdetail_applicantdetail_component_applicantdetail, src_app_pages_applicants_applicantlists_applicantlists_component_applicantlistpage, src_app_pages_dashboard_dashboard_component_dashboardpage [INFERRED 0.80]
- **Shared Pagination Pattern Across HOD List Pages** — src_app_widgets_app_pagination_app_pagination_component, src_app_pages_hod_result_review_hod_result_review_component, src_app_pages_hod_students_record_hod_students_record_component, src_app_pages_hod_verification_course_registration_review_hod_course_registration_review_component, src_app_pages_hod_verification_document_verification_hod_document_verification_component [INFERRED 0.85]
- **HOD Pending/Approve Review Workflow** — src_app_pages_hod_result_review_hod_result_review_component, src_app_pages_hod_verification_course_registration_review_hod_course_registration_review_component, src_app_pages_hod_verification_document_verification_hod_document_verification_component [INFERRED 0.80]
- **Lecturer Dashboard to Course Upload Navigation Flow** — src_app_pages_lecturer_lecturer_dashboard_lecturer_dashboard_component, src_app_pages_lecturer_lecturer_my_courses_lecturer_my_courses_component, src_app_pages_lecturer_lecturer_course_details_lecturer_course_details_component, src_app_pages_lecturer_lecturer_course_upload_lecturer_course_upload_component [EXTRACTED 1.00]
- **List Filtering and Display Toolkit** — src_app_widgets_filter_select_filter_select_component_template, src_app_widgets_search_input_search_input_component_template, src_app_widgets_reusable_table_reusable_table_component_template [INFERRED 0.75]
- **Dashboard Summary Widgets (chart, metric, loading state)** — src_app_widgets_doughnut_doughnut_component_template, src_app_widgets_metric_card_metric_card_component_template, src_app_widgets_busy_indicator_busy_indicator_component_template [INFERRED 0.65]
- **Application Shell Layout (sidebar, topbar, root document)** — src_app_widgets_sidebar_sidebar_component_template, src_app_widgets_topbar_topbar_component_template, src_index_template [INFERRED 0.75]

## Communities (118 total, 56 thin omitted)

### Community 0 - "AdmissionsComponent"

Cohesion: 0.05
Nodes (4): AdmissionsComponent, Component, ApplicationSetupItem, UpdateFileSelection

### Community 1 - "PaymentRecordComponent"

Cohesion: 0.07
Nodes (20): PaymentRecordComponent, Component, PAYMENT_BREAKDOWN_CARD_ORDER, FilterOption, PaymentBreakdown, PaymentDashboardDto, PaymentDetailDto, PaymentsListItemDto (+12 more)

### Community 2 - "ApplicantdetailComponent"

Cohesion: 0.06
Nodes (6): ApplicationStatusDefinition, AcademicHistory, ApplicantdetailComponent, Component, Input, Output

### Community 3 - "HodStateService"

Cohesion: 0.06
Nodes (12): HodCoursesComponent, Component, HodOverviewComponent, Component, HodProfileComponent, Component, HodStateService, Injectable (+4 more)

### Community 4 - "HodCourseRegistrationReviewService"

Cohesion: 0.11
Nodes (10): HodCourseRegistrationRecord, HodRegisteredCourse, HodCourseRegistrationApprovePayload, HodCourseRegistrationDetailQuery, HodCourseRegistrationQuery, HodCourseRegistrationReviewComponent, Component, HodCourseRegistrationReviewService (+2 more)

### Community 5 - "hod.constants.ts"

Cohesion: 0.09
Nodes (28): buildCourseLevelConfiguration(), buildCoursePublicationHistoryRecord(), buildCourseRegistrationRecord(), buildDocumentVerificationRecord(), buildRegisteredCourses(), buildResultReviewRecord(), buildResultStudentRows(), buildStudentAcademicPerformance() (+20 more)

### Community 7 - "devDependencies"

Cohesion: 0.05
Nodes (43): @angular/compiler-cli, @angular-devkit/build-angular, angular-eslint, eslint, husky, jasmine-core, karma, karma-chrome-launcher (+35 more)

### Community 8 - "HodAssignCoursesComponent"

Cohesion: 0.12
Nodes (7): HodLecturerCourse, HodAssignCoursesComponent, Component, LecturerAssignedCoursesModalComponent, Component, Input, Output

### Community 9 - "SidebarComponent"

Cohesion: 0.13
Nodes (3): HostListener, SidebarComponent, Component

### Community 10 - "applicant.ts"

Cohesion: 0.08
Nodes (24): AdmissionSummary, Application, ApplicationListResponse, ApplicationSummary, CertificateOfBirth, CertificateOfOrigin, CorrespondenceAddress, Country (+16 more)

### Community 11 - "http.interceptor.ts"

Cohesion: 0.09
Nodes (19): AppComponent, Component, appConfig, collectMessages(), collectMessagesRecursively(), contentTypeInterceptor(), errorInterceptor(), extractMessageFromObject() (+11 more)

### Community 12 - "HodDocumentVerificationService"

Cohesion: 0.07
Nodes (17): HodDocumentVerificationRecord, HodLecturer, HodVerificationDocument, AssignCoursesRequestPayload, HodLecturersComponent, Component, HodLecturersService, Injectable (+9 more)

### Community 13 - "HodResultReviewService"

Cohesion: 0.11
Nodes (9): HodResultReviewRecord, HodResultStudentRow, HodCourseResultsApproveQuery, HodCourseResultsQuery, HodResultReviewComponent, Component, HodResultReviewService, Injectable (+1 more)

### Community 14 - "AuthService"

Cohesion: 0.09
Nodes (6): NgModule, LoginComponent, Component, AuthService, Injectable, ShareModule

### Community 15 - "hod-document-verification.component.ts"

Cohesion: 0.09
Nodes (20): HOD_FLAG_DOCUMENT_OPTIONS, HOD_FLAG_REASON_OPTIONS, HOD_PROGRAMME_FILTER_OPTIONS, ResultReviewTab, CourseRegistrationReviewDrawerComponent, Component, CourseRegistrationTab, DocumentVerificationTab (+12 more)

### Community 16 - "hod.types.ts"

Cohesion: 0.12
Nodes (17): CoursePublicationHistoryModalComponent, Component, Input, Output, CourseCatalogueSection, CourseSetupStage, HodState, HodCourseCatalogueCourse (+9 more)

### Community 17 - "application.service.ts"

Cohesion: 0.11
Nodes (16): AdminDashboardMetrics, ApprovalStatusBreakdown, PaymentStatusCount, TopCourseMetric, ApplicantActionPayload, ApplicationAdminDashboardResponse, ApplicationSetupListResponse, ApproveApplicantsDataItem (+8 more)

### Community 18 - "lecturer-state.service.ts"

Cohesion: 0.15
Nodes (20): buildLecturerStudents(), COURSE_UPLOAD_STAGE, createStudent(), GRADE_SCALE, LECTURER_COURSES, LECTURER_LEVEL_LABEL_BY_COURSE_PREFIX, LECTURER_PROFILE, LECTURER_RESULT_TEMPLATE_HEADERS (+12 more)

### Community 19 - "TopbarComponent"

Cohesion: 0.12
Nodes (4): AdminLayoutComponent, Component, TopbarComponent, Component

### Community 20 - "HodCourseSetupComponent"

Cohesion: 0.10
Nodes (4): HodCourseSetupComponent, Component, HodCourseRequirementType, HodLevelFilterOption

### Community 23 - "DashboardComponent"

Cohesion: 0.12
Nodes (3): SetCutoffPayload, DashboardComponent, Component

### Community 24 - "applicantlists.component.ts"

Cohesion: 0.12
Nodes (15): APPLICATION_STATUS_OPTIONS, ApplicantCardFilter, ApplicantFilterCard, CARD_FILTER_APPROVAL_STATUS, FilterOption, ExportOption, ExportApplicantsPayload, MetricCardComponent (+7 more)

### Community 25 - "AdmissionsUploadFlowComponent"

Cohesion: 0.12
Nodes (4): AdmissionsUploadFlowComponent, Component, Input, Output

### Community 26 - "dashboard.component.ts"

Cohesion: 0.18
Nodes (15): APPLICATION_STATUS_DEFINITIONS, APPLICATION_STATUS_DESCRIPTIONS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER, APPLICATION_STATUS_TONES, ApplicationStatusKey, ApplicationStatusOption, APPLICATION_ACTION_DISABLED_STATUS_KEYS (+7 more)

### Community 27 - "hod-students-record.component.ts"

Cohesion: 0.11
Nodes (10): HodProgrammeFilterOption, HodStudentRecord, HodStudentRecordDrawerTab, HodStudentsRecordComponent, Component, StudentRecordDetailsDrawerComponent, StudentRecordDrawerTabOption, Component (+2 more)

### Community 28 - "hod-assign-courses.component.ts"

Cohesion: 0.27
Nodes (7): HOD_LEVEL_FILTER_OPTIONS, HodLecturerAssignmentHistoryRecord, PendingAssignmentChange, LecturerAssignmentHistoryModalComponent, Component, Input, Output

### Community 30 - "lecturer-results.service.ts"

Cohesion: 0.20
Nodes (7): LecturerCourseSingleResponse, LecturerResultsUploadResponse, LecturerStudentResultUpdatePayload, LecturerResultsService, Injectable, UnknownRecord, LecturerStudentResult

### Community 31 - "ButtonComponent"

Cohesion: 0.11
Nodes (13): ProgrammeOption, OptionItem, AdmissionUploadMode, AdmissionUploadStage, UploadFlowConfig, HodDashboardComponent, Component, ButtonComponent (+5 more)

### Community 33 - "dependencies"

Cohesion: 0.13
Nodes (15): angular2-notifications, @angular/animations, @angular/platform-browser, @angular/router, bootstrap, bootstrap-icons, dependencies, angular2-notifications (+7 more)

### Community 35 - "hod-state.service.ts"

Cohesion: 0.12
Nodes (13): HOD_COURSE_CATALOGUE_COURSES, HOD_COURSE_LEVEL_CONFIGURATIONS, HOD_COURSE_OVERVIEW_LEVELS, HOD_COURSE_PUBLICATION_HISTORY, HOD_LECTURER_ASSIGNMENT_HISTORY, HOD_LECTURER_COURSES, HOD_PROFILE, HOD_STUDENT_RECORDS (+5 more)

### Community 37 - "options"

Cohesion: 0.21
Nodes (13): options, assets, browser, index, inlineStyleLanguage, outputPath, polyfills, scripts (+5 more)

### Community 39 - "LecturerCourseAssignmentService"

Cohesion: 0.29
Nodes (4): LecturerCourseAssignmentService, Injectable, StaffAssignedCourseApiItem, StaffAssignedCoursesQuery

### Community 40 - "Applicant Detail View"

Cohesion: 0.20
Nodes (12): Admissions Page, Change Programme Modal, Set Cutoff Modal, Admissions Upload Flow (CBT Wizard), Applicant Detail View, Applicant List Page, Applicant Export Modal, Applicants Route Shell (+4 more)

### Community 42 - "UpdateFileModalComponent"

Cohesion: 0.20
Nodes (4): Component, Input, Output, UpdateFileModalComponent

### Community 43 - "architect"

Cohesion: 0.18
Nodes (11): extract-i18n, lint, test, architect, builder, builder, options, lintFilePatterns (+3 more)

### Community 44 - "PermissionService"

Cohesion: 0.19
Nodes (9): routes, APP_PERMISSION_LIST, APP_PERMISSIONS, AppPermission, normalizePermission(), PermissionMatchMode, permissionGuard(), PermissionService (+1 more)

### Community 45 - "auth.service.ts"

Cohesion: 0.24
Nodes (7): ProfileFailResponse, ProfilePayload, ProfileSuccessResponse, validationCheckDTO, LoginResponse, OtpTokenResponse, RefreshTokenResponse

### Community 46 - "SetCutoffModalComponent"

Cohesion: 0.27
Nodes (4): SetCutoffModalComponent, Component, Input, Output

### Community 47 - "ApplicantExportModalComponent"

Cohesion: 0.20
Nodes (4): ApplicantExportModalComponent, Component, Input, Output

### Community 48 - "development"

Cohesion: 0.20
Nodes (10): build, builder, configurations, defaultConfiguration, development, buildTarget, extractLicenses, fileReplacements (+2 more)

### Community 49 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, format, format:write, lint, ng, prepare, start (+2 more)

### Community 50 - "applicantdetail.component.ts"

Cohesion: 0.10
Nodes (13): ContentChild, Certificate, OLevelResult, ApplicantDocumentFile, ComplianceDirectivePayload, ActionNoteModalComponent, Component, Input (+5 more)

### Community 51 - "production"

Cohesion: 0.22
Nodes (9): serve, production, budgets, buildTarget, fileReplacements, outputHashing, builder, configurations (+1 more)

### Community 52 - "package.json"

Cohesion: 0.22
Nodes (8): lint-staged, _.{scss,css,json,md,yml,yaml}, _.{ts,html}, name, private, version, eslint --fix, prettier --write

### Community 53 - "consmmefadmin"

Cohesion: 0.25
Nodes (8): prefix, projectType, root, schematics, sourceRoot, consmmefadmin, style, @schematics/angular:component

### Community 54 - "angular.json"

Cohesion: 0.29
Nodes (6): analytics, cli, newProjectRoot, projects, $schema, version

### Community 55 - "eslint.config.js"

Cohesion: 0.29
Nodes (6): schematicCollections, angular, { defineConfig }, eslint, tseslint, angular-eslint

### Community 56 - "sidebar.component.ts"

Cohesion: 0.17
Nodes (9): appstatus, Column, role, sidebarStateDTO, Injectable, WidgetService, SidebarMenuItem, SidebarMenuSection (+1 more)

### Community 57 - "BusyIndicatorComponent"

Cohesion: 0.40
Nodes (3): BusyIndicatorComponent, Component, Input

### Community 58 - "styles"

Cohesion: 0.40
Nodes (5): styles, node_modules/bootstrap/dist/css/bootstrap.min.css, node_modules/bootstrap-icons/font/bootstrap-icons.css, node_modules/ngx-spinner/animations/line-scale.css, src/styles.scss

### Community 59 - "HtmliconComponent"

Cohesion: 0.50
Nodes (3): HtmliconComponent, Component, Input

### Community 61 - "lecturer-course-details.component.ts"

Cohesion: 0.15
Nodes (7): LECTURER_UPLOAD_STAGE, LecturerUploadStage, LecturerDashboardComponent, Component, LecturerMyCoursesComponent, Component, AcademicPortalRole

### Community 62 - "App Root Shell Template"

Cohesion: 1.00
Nodes (3): App Root Shell Template, Admin Login Page, Admin Layout Shell

### Community 64 - "StatusIndicatorComponent Template"

Cohesion: 0.67
Nodes (3): BusyIndicatorComponent Template, MetricCardComponent Template, StatusIndicatorComponent Template

### Community 65 - "SidebarComponent Template"

Cohesion: 0.67
Nodes (3): SidebarComponent Template, TableRowActionsComponent Template, TopbarComponent Template

### Community 69 - "topbar.component.ts"

Cohesion: 0.36
Nodes (3): DashboardInfo, DashboardinformationService, Injectable

### Community 71 - "DoughnutComponent"

Cohesion: 0.43
Nodes (3): DoughnutComponent, Component, Input

### Community 111 - "HasPermissionDirective"

Cohesion: 0.38
Nodes (3): Directive, HasPermissionDirective, Input

### Community 112 - "admissions.component.ts"

Cohesion: 0.09
Nodes (19): ApplicationStatusTone, AdmissionDecisionFilter, AdmissionFilterCard, AdmissionTableRow, ChangeProgrammeSelection, LazyLoadEvent, PagingEvent, ProgrammeOption (+11 more)

## Knowledge Gaps

- **252 isolated node(s):** `$schema`, `version`, `newProjectRoot`, `projectType`, `style` (+247 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `ApplicantdetailComponent` connect `ApplicantdetailComponent` to `applicant.ts`, `admissions.component.ts`, `applicantdetail.component.ts`, `applicantlists.component.ts`, `dashboard.component.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `AdmissionsComponent` connect `AdmissionsComponent` to `admissions.component.ts`, `applicant.ts`, `sidebar.component.ts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `BusyIndicatorService` connect `hod-state.service.ts` to `PaymentRecordComponent`, `http.interceptor.ts`, `admissions.component.ts`, `lecturer-state.service.ts`, `applicantlists.component.ts`, `dashboard.component.ts`, `lecturer-course-details.component.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `newProjectRoot` to the rest of the system?**
  _252 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdmissionsComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.05289193302891933 - nodes in this community are weakly interconnected._
- **Should `PaymentRecordComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.0679563492063492 - nodes in this community are weakly interconnected._
- **Should `ApplicantdetailComponent` be split into smaller, more focused modules?**
  _Cohesion score 0.06453634085213032 - nodes in this community are weakly interconnected._

# Graph Report - C:\Users\DELL LATITUDE E5580\Documents\programming-projects\angular\AdministrativePlatformv2 (2026-07-30)

## Corpus Check

- 197 files · ~86,928 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1437 nodes · 2605 edges · 110 communities (56 shown, 54 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.77)
- Token cost: 0 input · 658,062 output

## Community Hubs (Navigation)

- Admissions Area
- Payment Record Area
- Applicantdetail Area
- Hod State Area
- Hod Course Registration Review Area
- Hod Area
- Applicantlists Area
- Package
- Hod Assign Courses Area
- Sidebar Area
- Applicant Area
- Theme Area
- Hod Document Verification Area
- Hod Result Review Area
- Auth Area
- Applicantlists Area
- Hod Area
- Application Area
- Lecturer Area
- Topbar Area
- Hod Course Setup Area
- Lecturer State
- Application Area
- Dashboard Area
- Admissions Area
- Admissions Upload Flow
- Change Programme Modal Area
- Hod Students Record Area
- Lecturer Assignment History Modal Area
- Portal Context Area
- Lecturer Results Area
- Application Status Area
- Course Registration Review Drawer Area
- Package
- Lecturer Course Details
- Busy Indicator Area
- Lecturer Course Upload
- Angular
- Notification Area
- Lecturer Course Assignment Area
- Admissions Area
- Hod Document Verification
- Update File Modal
- Angular
- Application Status Area
- Auth Area
- Set Cutoff Modal
- Applicant Export Modal
- Angular
- Package
- Doughnut Area
- Angular
- Package
- Angular
- Angular
- Eslint Config Area
- Applicantlists Area
- Busy Indicator Area
- Angular
- Htmlicon Area
- Applicants Area
- Lecturer My Courses
- App Area
- Hod Module Placeholder
- Busy Indicator Area
- Sidebar Area
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Ci Area
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Button Area
- Filter Select Area
- Environment Development
- Environment Production
- Background
- Arrow Right
- Capa 1
- Export1
- Layer 1
- Layer 2
- Layer 3
- Search
- Doc
- Logo
- Sblogo
- Statuslogo
- Hod Dashboard
- Hod Module Placeholder
- Hod Overview
- Lecturer
- Doughnut
- Htmlicon
- Reusable Table
- Background
- Doc
- Logo
- Sblogo
- Statuslogo
- Index

## God Nodes (most connected - your core abstractions)

1. `AdmissionsComponent` - 75 edges
2. `ApplicantdetailComponent` - 63 edges
3. `ApplicantlistsComponent` - 53 edges
4. `HodStateService` - 52 edges
5. `PaymentRecordComponent` - 34 edges
6. `LecturerStateService` - 29 edges
7. `ApplicationService` - 29 edges
8. `DashboardComponent` - 28 edges
9. `AuthService` - 28 edges
10. `ButtonComponent` - 27 edges

## Surprising Connections (you probably didn't know these)

- `Consmmefadmin Project README` --conceptually_related_to--> `CI Quality Job` [INFERRED]
  README.md → .github/workflows/ci.yml
- `Change Programme Modal` --semantically_similar_to--> `Set Cutoff Modal` [INFERRED] [semantically similar]
  src/app/pages/admissions/change-programme-modal/change-programme-modal.component.html → src/app/pages/admissions/set-cutoff-modal/set-cutoff-modal.component.html
- `Admissions Upload Flow (CBT Wizard)` --semantically_similar_to--> `HOD Course Setup Wizard` [INFERRED] [semantically similar]
  src/app/pages/admissions/upload-flow/admissions-upload-flow.component.html → src/app/pages/hod/courses/setup/hod-course-setup.component.html
- `BusyIndicatorComponent Template` --semantically_similar_to--> `StatusIndicatorComponent Template` [INFERRED] [semantically similar]
  src/app/widgets/busy-indicator/busy-indicator.component.html → src/app/widgets/status-indicator/status-indicator.component.html
- `FilterSelectComponent Template` --semantically_similar_to--> `SearchInputComponent Template` [INFERRED] [semantically similar]
  src/app/widgets/filter-select/filter-select.component.html → src/app/widgets/search-input/search-input.component.html

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

## Communities (110 total, 54 thin omitted)

### Community 0 - "Admissions Area"

Cohesion: 0.06
Nodes (3): AdmissionsComponent, Component, UpdateFileSelection

### Community 1 - "Payment Record Area"

Cohesion: 0.06
Nodes (24): AdmissionTableRow, ApplicationListRow, DashboardRow, PaymentRecordComponent, Component, PAYMENT_BREAKDOWN_CARD_ORDER, FilterOption, PaymentBreakdown (+16 more)

### Community 2 - "Applicantdetail Area"

Cohesion: 0.07
Nodes (5): AcademicHistory, ApplicantdetailComponent, Component, Input, Output

### Community 3 - "Hod State Area"

Cohesion: 0.05
Nodes (14): HodCoursesComponent, Component, HodDashboardComponent, Component, HodOverviewComponent, Component, HodProfileComponent, Component (+6 more)

### Community 4 - "Hod Course Registration Review Area"

Cohesion: 0.10
Nodes (10): HodCourseRegistrationRecord, HodRegisteredCourse, HodCourseRegistrationApprovePayload, HodCourseRegistrationDetailQuery, HodCourseRegistrationQuery, HodCourseRegistrationReviewComponent, Component, HodCourseRegistrationReviewService (+2 more)

### Community 5 - "Hod Area"

Cohesion: 0.07
Nodes (38): buildCourseLevelConfiguration(), buildCoursePublicationHistoryRecord(), buildCourseRegistrationRecord(), buildDocumentVerificationRecord(), buildRegisteredCourses(), buildResultReviewRecord(), buildResultStudentRows(), buildStudentAcademicPerformance() (+30 more)

### Community 7 - "Package"

Cohesion: 0.05
Nodes (43): @angular/compiler-cli, @angular-devkit/build-angular, angular-eslint, eslint, husky, jasmine-core, karma, karma-chrome-launcher (+35 more)

### Community 8 - "Hod Assign Courses Area"

Cohesion: 0.07
Nodes (9): HodLecturer, HodAssignCoursesComponent, Component, AssignCoursesRequestPayload, HodLecturersComponent, Component, HodLecturersService, Injectable (+1 more)

### Community 9 - "Sidebar Area"

Cohesion: 0.08
Nodes (12): HostListener, appstatus, Column, role, sidebarStateDTO, Injectable, WidgetService, SidebarComponent (+4 more)

### Community 10 - "Applicant Area"

Cohesion: 0.06
Nodes (31): ContentChild, AdmissionSummary, ApplicationSummary, Certificate, CertificateOfBirth, CertificateOfOrigin, CorrespondenceAddress, Country (+23 more)

### Community 11 - "Theme Area"

Cohesion: 0.09
Nodes (20): AppComponent, Component, appConfig, routes, collectMessages(), collectMessagesRecursively(), contentTypeInterceptor(), errorInterceptor() (+12 more)

### Community 12 - "Hod Document Verification Area"

Cohesion: 0.13
Nodes (10): HodDocumentVerificationRecord, HodVerificationDocument, HodDocumentFlagIssuePayload, HodDocumentVerificationApiDocument, HodDocumentVerificationApiStudent, HodDocumentVerificationStatusPayload, HodDocumentVerificationService, Injectable (+2 more)

### Community 13 - "Hod Result Review Area"

Cohesion: 0.11
Nodes (9): HodResultReviewRecord, HodResultStudentRow, HodCourseResultsApproveQuery, HodCourseResultsQuery, HodResultReviewComponent, Component, HodResultReviewService, Injectable (+1 more)

### Community 14 - "Auth Area"

Cohesion: 0.09
Nodes (6): NgModule, LoginComponent, Component, AuthService, Injectable, ShareModule

### Community 15 - "Applicantlists Area"

Cohesion: 0.14
Nodes (23): ApplicantCardFilter, ApplicantFilterCard, FilterOption, HOD_PROGRAMME_FILTER_OPTIONS, HodProgrammeFilterOption, ResultReviewTab, CourseRegistrationTab, DocumentVerificationTab (+15 more)

### Community 16 - "Hod Area"

Cohesion: 0.11
Nodes (18): CoursePublicationHistoryModalComponent, Component, Input, Output, CourseCatalogueSection, CourseSetupStage, HodState, HodCourseCatalogueCourse (+10 more)

### Community 17 - "Application Area"

Cohesion: 0.09
Nodes (19): AdminDashboardMetrics, ApprovalStatusBreakdown, PaymentStatusCount, TopCourseMetric, OptionItem, SetCutoffPayload, ApplicantActionPayload, ApplicationAdminDashboardResponse (+11 more)

### Community 18 - "Lecturer Area"

Cohesion: 0.15
Nodes (20): buildLecturerStudents(), COURSE_UPLOAD_STAGE, createStudent(), GRADE_SCALE, LECTURER_COURSES, LECTURER_LEVEL_LABEL_BY_COURSE_PREFIX, LECTURER_PROFILE, LECTURER_RESULT_TEMPLATE_HEADERS (+12 more)

### Community 19 - "Topbar Area"

Cohesion: 0.13
Nodes (8): AdminLayoutComponent, Component, DashboardInfo, DashboardMetricCard, DashboardinformationService, Injectable, TopbarComponent, Component

### Community 20 - "Hod Course Setup Area"

Cohesion: 0.11
Nodes (3): HodCourseSetupComponent, Component, HodCourseRequirementType

### Community 22 - "Application Area"

Cohesion: 0.10
Nodes (3): ApplicationListResponse, ApplicationService, Injectable

### Community 24 - "Admissions Area"

Cohesion: 0.10
Nodes (16): AdmissionDecisionFilter, AdmissionFilterCard, ChangeProgrammeSelection, LazyLoadEvent, PagingEvent, ProgrammeOption, AdmissionAdminDashboardResponse, GetApplicantsQuery (+8 more)

### Community 25 - "Admissions Upload Flow"

Cohesion: 0.12
Nodes (4): AdmissionsUploadFlowComponent, Component, Input, Output

### Community 26 - "Change Programme Modal Area"

Cohesion: 0.10
Nodes (10): ChangeProgrammeModalComponent, ProgrammeOption, Component, Input, Output, ActionNoteModalComponent, Component, Input (+2 more)

### Community 27 - "Hod Students Record Area"

Cohesion: 0.12
Nodes (9): HodStudentRecord, HodStudentRecordDrawerTab, HodStudentsRecordComponent, Component, StudentRecordDetailsDrawerComponent, StudentRecordDrawerTabOption, Component, Input (+1 more)

### Community 28 - "Lecturer Assignment History Modal Area"

Cohesion: 0.16
Nodes (12): HOD_LEVEL_FILTER_OPTIONS, HodLecturerAssignmentHistoryRecord, HodLecturerCourse, PendingAssignmentChange, LecturerAssignedCoursesModalComponent, Component, Input, Output (+4 more)

### Community 29 - "Portal Context Area"

Cohesion: 0.17
Nodes (7): LECTURER_UPLOAD_STAGE, LecturerUploadStage, LecturerDashboardComponent, Component, AcademicPortalRole, PortalContextService, Injectable

### Community 30 - "Lecturer Results Area"

Cohesion: 0.20
Nodes (7): LecturerCourseSingleResponse, LecturerResultsUploadResponse, LecturerStudentResultUpdatePayload, LecturerResultsService, Injectable, UnknownRecord, LecturerStudentResult

### Community 31 - "Application Status Area"

Cohesion: 0.18
Nodes (13): APPLICATION_STATUS_DEFINITIONS, APPLICATION_STATUS_DESCRIPTIONS, APPLICATION_STATUS_OPTIONS, APPLICATION_STATUS_ORDER, APPLICATION_STATUS_TONES, ApplicationStatusDefinition, ApplicationStatusKey, ApplicationStatusOption (+5 more)

### Community 32 - "Course Registration Review Drawer Area"

Cohesion: 0.12
Nodes (6): CourseRegistrationReviewDrawerComponent, Component, ButtonComponent, Component, Input, Output

### Community 33 - "Package"

Cohesion: 0.13
Nodes (15): angular2-notifications, @angular/animations, @angular/router, bootstrap, bootstrap-icons, chart.js, dependencies, angular2-notifications (+7 more)

### Community 35 - "Busy Indicator Area"

Cohesion: 0.19
Nodes (5): BusyIndicatorService, Injectable, NotificationSeverity, SessionStateService, Injectable

### Community 37 - "Angular"

Cohesion: 0.21
Nodes (13): options, assets, browser, index, inlineStyleLanguage, outputPath, polyfills, scripts (+5 more)

### Community 38 - "Notification Area"

Cohesion: 0.22
Nodes (5): AdmissionUploadMode, AdmissionUploadStage, UploadFlowConfig, NotificationService, Injectable

### Community 39 - "Lecturer Course Assignment Area"

Cohesion: 0.29
Nodes (4): LecturerCourseAssignmentService, Injectable, StaffAssignedCourseApiItem, StaffAssignedCoursesQuery

### Community 40 - "Admissions Area"

Cohesion: 0.20
Nodes (12): Admissions Page, Change Programme Modal, Set Cutoff Modal, Admissions Upload Flow (CBT Wizard), Applicant Detail View, Applicant List Page, Applicant Export Modal, Applicants Route Shell (+4 more)

### Community 42 - "Update File Modal"

Cohesion: 0.17
Nodes (5): Component, Input, Output, UpdateFieldOption, UpdateFileModalComponent

### Community 43 - "Angular"

Cohesion: 0.18
Nodes (11): extract-i18n, lint, test, architect, builder, builder, options, lintFilePatterns (+3 more)

### Community 44 - "Application Status Area"

Cohesion: 0.24
Nodes (6): APPLICATION_ACTION_DISABLED_STATUS_KEYS, getApplicationStatusDefinition(), normalizeApplicationStatusKey(), shouldDisableComplianceAction(), shouldDisableShortlistAction(), Application

### Community 45 - "Auth Area"

Cohesion: 0.24
Nodes (7): ProfileFailResponse, ProfilePayload, ProfileSuccessResponse, validationCheckDTO, LoginResponse, OtpTokenResponse, RefreshTokenResponse

### Community 46 - "Set Cutoff Modal"

Cohesion: 0.27
Nodes (4): SetCutoffModalComponent, Component, Input, Output

### Community 47 - "Applicant Export Modal"

Cohesion: 0.20
Nodes (4): ApplicantExportModalComponent, Component, Input, Output

### Community 48 - "Angular"

Cohesion: 0.20
Nodes (10): build, builder, configurations, defaultConfiguration, development, buildTarget, extractLicenses, fileReplacements (+2 more)

### Community 49 - "Package"

Cohesion: 0.20
Nodes (10): scripts, build, format, format:write, lint, ng, prepare, start (+2 more)

### Community 50 - "Doughnut Area"

Cohesion: 0.29
Nodes (4): APPLICATION_STATUS_LABELS, DoughnutComponent, Component, Input

### Community 51 - "Angular"

Cohesion: 0.22
Nodes (9): serve, production, budgets, buildTarget, fileReplacements, outputHashing, builder, configurations (+1 more)

### Community 52 - "Package"

Cohesion: 0.22
Nodes (8): lint-staged, _.{scss,css,json,md,yml,yaml}, _.{ts,html}, name, private, version, eslint --fix, prettier --write

### Community 53 - "Angular"

Cohesion: 0.25
Nodes (8): prefix, projectType, root, schematics, sourceRoot, consmmefadmin, style, @schematics/angular:component

### Community 54 - "Angular"

Cohesion: 0.29
Nodes (6): analytics, cli, newProjectRoot, projects, $schema, version

### Community 55 - "Eslint Config Area"

Cohesion: 0.29
Nodes (6): schematicCollections, angular, { defineConfig }, eslint, tseslint, angular-eslint

### Community 57 - "Busy Indicator Area"

Cohesion: 0.40
Nodes (3): BusyIndicatorComponent, Component, Input

### Community 58 - "Angular"

Cohesion: 0.40
Nodes (5): styles, node_modules/bootstrap/dist/css/bootstrap.min.css, node_modules/bootstrap-icons/font/bootstrap-icons.css, node_modules/ngx-spinner/animations/line-scale.css, src/styles.scss

### Community 59 - "Htmlicon Area"

Cohesion: 0.50
Nodes (3): HtmliconComponent, Component, Input

### Community 62 - "App Area"

Cohesion: 1.00
Nodes (3): App Root Shell Template, Admin Login Page, Admin Layout Shell

### Community 64 - "Busy Indicator Area"

Cohesion: 0.67
Nodes (3): BusyIndicatorComponent Template, MetricCardComponent Template, StatusIndicatorComponent Template

### Community 65 - "Sidebar Area"

Cohesion: 0.67
Nodes (3): SidebarComponent Template, TableRowActionsComponent Template, TopbarComponent Template

## Knowledge Gaps

- **251 isolated node(s):** `$schema`, `version`, `newProjectRoot`, `projectType`, `style` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `ApplicantdetailComponent` connect `Applicantdetail Area` to `Applicant Area`, `Application Status Area`, `Applicantlists Area`, `Topbar Area`, `Admissions Area`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `AdmissionsComponent` connect `Admissions Area` to `Admissions Area`, `Sidebar Area`, `Application Status Area`, `Application Area`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `BusyIndicatorService` connect `Busy Indicator Area` to `Payment Record Area`, `Hod Area`, `Theme Area`, `Applicantlists Area`, `Lecturer Area`, `Topbar Area`, `Admissions Area`, `Portal Context Area`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `newProjectRoot` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admissions Area` be split into smaller, more focused modules?**
  _Cohesion score 0.056692242114237 - nodes in this community are weakly interconnected._
- **Should `Payment Record Area` be split into smaller, more focused modules?**
  _Cohesion score 0.06377204884667571 - nodes in this community are weakly interconnected._
- **Should `Applicantdetail Area` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._

import {
  ApplicationStatusDefinition,
  ApplicationStatusKey,
  ApplicationStatusOption,
} from './application-status.types';

export const APPLICATION_STATUS_LABELS: Record<
  Exclude<ApplicationStatusKey, 'unknown'>,
  string
> = {
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  resubmitted: 'Resubmitted',
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  admitted: 'Admitted',
  compliance_required: 'Complaince Required',
  admitted_internally: 'Pending Publish',
  auto_rejected: 'Auto Unqualified',
};

export const APPLICATION_STATUS_DESCRIPTIONS: Record<
  Exclude<ApplicationStatusKey, 'unknown'>,
  string
> = {
  submitted: 'Application has been submitted and is awaiting review.',
  approved:
    'Grant provisionally or unconditionally. The admission remains inconclusive.',
  rejected: 'Application has been rejected.',
  resubmitted: 'Applicant has resubmitted after a previous review.',
  pending: 'Application is pending review.',
  shortlisted: 'Shortlisted to write CBT.',
  admitted: 'Applicant has been admitted as a student.',
  compliance_required: 'Applicant must resolve outstanding compliance issues.',
  admitted_internally: 'Admission is ready internally but not yet published.',
  auto_rejected: 'Applicant failed the required criteria automatically.',
};

export const APPLICATION_STATUS_TONES: Record<
  Exclude<ApplicationStatusKey, 'unknown'>,
  ApplicationStatusDefinition['tone']
> = {
  submitted: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  resubmitted: 'resubmitted',
  pending: 'pending',
  shortlisted: 'shortlisted',
  admitted: 'admitted',
  compliance_required: 'directive',
  admitted_internally: 'pending',
  auto_rejected: 'rejected',
};

export const APPLICATION_STATUS_DEFINITIONS: Record<
  ApplicationStatusKey,
  ApplicationStatusDefinition
> = {
  submitted: {
    key: 'submitted',
    label: APPLICATION_STATUS_LABELS.submitted,
    description: APPLICATION_STATUS_DESCRIPTIONS.submitted,
    tone: APPLICATION_STATUS_TONES.submitted,
  },
  approved: {
    key: 'approved',
    label: APPLICATION_STATUS_LABELS.approved,
    description: APPLICATION_STATUS_DESCRIPTIONS.approved,
    tone: APPLICATION_STATUS_TONES.approved,
  },
  rejected: {
    key: 'rejected',
    label: APPLICATION_STATUS_LABELS.rejected,
    description: APPLICATION_STATUS_DESCRIPTIONS.rejected,
    tone: APPLICATION_STATUS_TONES.rejected,
  },
  resubmitted: {
    key: 'resubmitted',
    label: APPLICATION_STATUS_LABELS.resubmitted,
    description: APPLICATION_STATUS_DESCRIPTIONS.resubmitted,
    tone: APPLICATION_STATUS_TONES.resubmitted,
  },
  pending: {
    key: 'pending',
    label: APPLICATION_STATUS_LABELS.pending,
    description: APPLICATION_STATUS_DESCRIPTIONS.pending,
    tone: APPLICATION_STATUS_TONES.pending,
  },
  shortlisted: {
    key: 'shortlisted',
    label: APPLICATION_STATUS_LABELS.shortlisted,
    description: APPLICATION_STATUS_DESCRIPTIONS.shortlisted,
    tone: APPLICATION_STATUS_TONES.shortlisted,
  },
  admitted: {
    key: 'admitted',
    label: APPLICATION_STATUS_LABELS.admitted,
    description: APPLICATION_STATUS_DESCRIPTIONS.admitted,
    tone: APPLICATION_STATUS_TONES.admitted,
  },
  compliance_required: {
    key: 'compliance_required',
    label: APPLICATION_STATUS_LABELS.compliance_required,
    description: APPLICATION_STATUS_DESCRIPTIONS.compliance_required,
    tone: APPLICATION_STATUS_TONES.compliance_required,
  },
  admitted_internally: {
    key: 'admitted_internally',
    label: APPLICATION_STATUS_LABELS.admitted_internally,
    description: APPLICATION_STATUS_DESCRIPTIONS.admitted_internally,
    tone: APPLICATION_STATUS_TONES.admitted_internally,
  },
  auto_rejected: {
    key: 'auto_rejected',
    label: APPLICATION_STATUS_LABELS.auto_rejected,
    description: APPLICATION_STATUS_DESCRIPTIONS.auto_rejected,
    tone: APPLICATION_STATUS_TONES.auto_rejected,
  },
  unknown: {
    key: 'unknown',
    label: 'Pending',
    description: 'Application status is pending review.',
    tone: 'pending',
  },
};

export const APPLICATION_STATUS_ORDER: Exclude<
  ApplicationStatusKey,
  'unknown'
>[] = [
  'submitted',
  'approved',
  'rejected',
  'resubmitted',
  'pending',
  'shortlisted',
  'admitted',
  'compliance_required',
  'admitted_internally',
  'auto_rejected',
];

export const APPLICATION_STATUS_OPTIONS: ApplicationStatusOption[] =
  APPLICATION_STATUS_ORDER.map((statusKey) => ({
    label: APPLICATION_STATUS_LABELS[statusKey],
    value: statusKey,
  }));

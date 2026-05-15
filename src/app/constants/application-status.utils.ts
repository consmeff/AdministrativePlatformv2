import { APPLICATION_STATUS_DEFINITIONS } from './application-status.constants';
import {
  ApplicationStatusDefinition,
  ApplicationStatusKey,
} from './application-status.types';

type StatusAliasMap = Record<string, ApplicationStatusKey>;

const APPLICATION_ACTION_DISABLED_STATUS_KEYS: ApplicationStatusKey[] = [
  'shortlisted',
  'compliance_required',
  'admitted',
  'auto_rejected',
  'admitted_internally',
];

const APPLICATION_STATUS_ALIASES: StatusAliasMap = {
  submitted: 'submitted',
  approved: 'approved',
  rejected: 'rejected',
  resubmitted: 'resubmitted',
  pending: 'pending',
  shortlisted: 'shortlisted',
  admitted: 'admitted',
  compliance_required: 'compliance_required',
  complaince_required: 'compliance_required',
  compliance: 'compliance_required',
  admitted_internally: 'admitted_internally',
  admittedinternally: 'admitted_internally',
  pending_publish: 'admitted_internally',
  auto_rejected: 'auto_rejected',
  auto_unqualified: 'auto_rejected',
  issued_compliance_directive: 'compliance_required',
  compliance_required_: 'compliance_required',
};

export function normalizeApplicationStatusKey(
  status: string | null | undefined,
): ApplicationStatusKey {
  const normalizedStatus = (status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (normalizedStatus.length === 0) {
    return 'unknown';
  }

  if (APPLICATION_STATUS_ALIASES[normalizedStatus]) {
    return APPLICATION_STATUS_ALIASES[normalizedStatus];
  }

  if (normalizedStatus.includes('admitted_internally')) {
    return 'admitted_internally';
  }

  if (normalizedStatus.includes('auto_reject')) {
    return 'auto_rejected';
  }

  if (normalizedStatus.includes('resubmit')) {
    return 'resubmitted';
  }

  if (normalizedStatus.includes('shortlist')) {
    return 'shortlisted';
  }

  if (normalizedStatus.includes('compliance')) {
    return 'compliance_required';
  }

  if (normalizedStatus.includes('submitted')) {
    return 'submitted';
  }

  if (normalizedStatus.includes('pending')) {
    return 'pending';
  }

  if (normalizedStatus.includes('approved')) {
    return 'approved';
  }

  if (normalizedStatus.includes('admitted')) {
    return 'admitted';
  }

  if (normalizedStatus.includes('reject')) {
    return 'rejected';
  }

  return 'unknown';
}

export function getApplicationStatusDefinition(
  status: string | null | undefined,
): ApplicationStatusDefinition {
  const normalizedStatusKey = normalizeApplicationStatusKey(status);
  return APPLICATION_STATUS_DEFINITIONS[normalizedStatusKey];
}

export function shouldDisableComplianceAction(
  status: string | null | undefined,
): boolean {
  const normalizedStatusKey = normalizeApplicationStatusKey(status);
  return APPLICATION_ACTION_DISABLED_STATUS_KEYS.includes(normalizedStatusKey);
}

export function shouldDisableShortlistAction(
  status: string | null | undefined,
): boolean {
  const normalizedStatusKey = normalizeApplicationStatusKey(status);
  return APPLICATION_ACTION_DISABLED_STATUS_KEYS.includes(normalizedStatusKey);
}

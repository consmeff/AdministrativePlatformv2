export interface HodDocumentFlagIssuePayload {
  student_id: number;
  compliance_directive: string;
}

export interface HodDocumentVerificationStatusPayload {
  student_id: number;
  is_verified: boolean;
}

export interface HodDocumentVerificationApiDocument {
  id?: number | string | null;
  name?: string | null;
  title?: string | null;
  document_name?: string | null;
  file_name?: string | null;
  file_size?: number | string | null;
  size?: number | string | null;
  file?: string | null;
  document?: string | null;
  url?: string | null;
  preview_url?: string | null;
}

export interface HodDocumentVerificationApiStudent {
  id?: number | string | null;
  student_id?: number | string | null;
  name?: string | null;
  full_name?: string | null;
  student_name?: string | null;
  matriculation_no?: string | null;
  matric_no?: string | null;
  application_no?: string | null;
  registration_number?: string | null;
  level?: string | { name?: string | null } | null;
  level_label?: string | null;
  current_level?: string | null;
  programme?: string | { name?: string | null } | null;
  program?: string | { name?: string | null } | null;
  department?: string | { name?: string | null } | null;
  documents?: HodDocumentVerificationApiDocument[] | null;
  compliance_directive?: string | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
}

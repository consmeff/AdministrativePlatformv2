export interface ApplicationListResponse {
  page_size: number;
  current_page: number;
  last_page: number;
  total: number;
  next_page_url: string;
  prev_page_url: string | null;
  data: Application[];
}

export interface Application {
  id: number;
  application_no: string;
  first_name: string;
  last_name: string;
  other_names: string;
  email: string;
  phone_number: string;
  alt_phone_number: string;
  certificate_of_birth?: CertificateOfBirth;
  o_level_result?: OLevelResult[];
  certificate_of_origin?: CertificateOfOrigin;
  passport_photo?: PassportPhoto;
  marital_status: string;
  payment_status: string;
  payment_slip?: PaymentSlip;
  dob?: string;
  gender: string;
  utme_result?: UtmeResult;
  residential_address?: ResidentialAddress;
  correspondence_address?: CorrespondenceAddress;
  nationality?: string;
  disability?: string;
  state_of_origin?: string;
  lga?: string;
  primary_parent_or_guardian?: PrimaryParentOrGuardian;
  secondary_parent_or_guardian: PrimaryParentOrGuardian | null;
  approval_status: string;
  payment_record: Record<string, unknown> | null;
  program: Program;
  session: Session;
  academic_history: AcademicHistory[];
  department: Department;
  compliance_directive?: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateOfBirth {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface OLevelResult {
  name: string;
  subjects: Subject[];
  file: File;
}

export interface Subject {
  subject: string;
  grade: string;
}

export interface File {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface CertificateOfOrigin {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface PassportPhoto {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface PaymentSlip {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface UtmeResult {
  file: File2;
  score?: number;
}

export interface File2 {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface ResidentialAddress {
  address: string;
  street_name: string;
  land_mark: string;
  city: string;
  lga: Lga;
  state: State;
  country: Country;
}

export interface Lga {
  id: number;
  name: string;
}

export interface State {
  id: number;
  name: string;
  capital: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface CorrespondenceAddress {
  address: string;
  street_name: string;
  land_mark: string;
  city: string;
  lga: Lga2;
  state: State2;
  country: Country2;
}

export interface Lga2 {
  id: number;
  name: string;
}

export interface State2 {
  id: number;
  name: string;
  capital: string;
}

export interface Country2 {
  id: number;
  name: string;
}

export interface PrimaryParentOrGuardian {
  title: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  email: string;
  gender: string;
  phone_number: string;
  alt_phone_number?: string;
  occupation: string;
  residential_address: string;
  correspondence_address: string;
  nationality: string;
  state_of_origin: string;
  lga: string;
}

export interface Program {
  id: number;
  name: string;
  code: string;
}

export interface Session {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export interface AcademicHistory {
  institution: string;
  certificate_type: string;
  from_date: string;
  to_date: string;
  certificate?: Certificate;
}

export interface Certificate {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface ApplicationSummary {
  application_no: string;
  first_name: string;
  last_name: string;
  created_at: string;
  program: string;
  approval_status: string;
  action: string;
}

export interface AdmissionSummary {
  application_no: string;
  full_name: string;

  submission_date: string;
  program: string;
  approval_status: string;
}

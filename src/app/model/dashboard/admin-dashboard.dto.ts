export interface AdminDashboardMetrics {
  total_applicants: number;
  top_5_courses: TopCourseMetric[];
  approval_status_breakdown: ApprovalStatusBreakdown;
  payment_status_counts: PaymentStatusCount[];
}

export interface TopCourseMetric {
  department__id: number;
  department__name: string;
  applicant_count: number;
}

export interface ApprovalStatusBreakdown {
  total_pending: number;
  total_rejected: number;
  total_shortlisted: number;
  total_approved: number;
  total_admitted: number;
  total_compliance_required: number;
}

export interface PaymentStatusCount {
  payment_status: string;
  count: number;
}

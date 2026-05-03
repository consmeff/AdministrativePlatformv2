import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  ApplicationListResponse,
} from '../model/dashboard/applicant';
import { AdminDashboardMetrics } from '../model/dashboard/admin-dashboard.dto';

export interface ComplianceDirectivePayload {
  applicant_ids: number[];
  extra_note: string;
}

export interface ApplicantActionPayload {
  applicant_ids: number[];
}

export interface RejectApplicantPayload extends ApplicantActionPayload {
  extra_note: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly http = inject(HttpClient);

  apiRoot = environment.apiURL;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  getapplications(
    keyword?: string,
    page_size?: number,
    page = 1,
    sortField?: string | undefined,
    sortOrder?: number | undefined,
  ): Observable<ApplicationListResponse> {
    const baseUrl = `${this.apiRoot}/api/v1/applicants`;
    const params = new URLSearchParams();

    if (keyword) params.append('keyword', keyword);
    if (sortField)
      params.append(
        'ordering',
        sortOrder && sortOrder > 0 ? '-' + sortField : sortField,
      );
    if (page_size) params.append('page_size', page_size.toString());
    if (page) params.append('page', page.toString());

    const url = `${baseUrl}?${params.toString()}`;
    return this.http.get<ApplicationListResponse>(url);
  }

  getapplication(
    applicantNo: string,
  ): Observable<ApplicationListResponse | Application> {
    const url = `${this.apiRoot}/api/v1/applicants/single`;
    const params = new HttpParams().set('applicant_no', applicantNo);
    return this.http.get<ApplicationListResponse | Application>(url, {
      params,
    });
  }

  getAdminDashboardMetrics(): Observable<AdminDashboardMetrics> {
    const url = `${this.apiRoot}/api/v1/applicants/admin-dashboard`;
    return this.http.get<AdminDashboardMetrics>(url);
  }

  issueComplianceDirective(
    payload: ComplianceDirectivePayload,
  ): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/applicants/compliance-directive`;
    return this.http.post(url, payload);
  }

  shortlistApplicants(payload: ApplicantActionPayload): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/applicants/shortlist-applicants`;
    return this.http.post(url, payload);
  }

  rejectApplicants(payload: RejectApplicantPayload): Observable<unknown> {
    const url = `${this.apiRoot}/api/v1/applicants/reject-applicants`;
    return this.http.post(url, payload);
  }
}

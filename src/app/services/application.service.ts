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

export interface GetApplicantsQuery {
  approval_status?: string;
  form?: string;
  ordering?: string;
  payment_status?: string;
  application_no?: string;
  search?: string;
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
    query?: GetApplicantsQuery,
  ): Observable<ApplicationListResponse> {
    const baseUrl = `${this.apiRoot}/api/v1/applicants`;
    let params = new HttpParams();

    const effectiveSearch = query?.search ?? keyword;
    if (effectiveSearch) {
      params = params.set('search', effectiveSearch);
    }

    const effectiveOrdering =
      query?.ordering ??
      (sortField
        ? sortOrder && sortOrder > 0
          ? `-${sortField}`
          : sortField
        : undefined);
    if (effectiveOrdering) {
      params = params.set('ordering', effectiveOrdering);
    }

    if (query?.approval_status) {
      params = params.set('approval_status', query.approval_status);
    }
    if (query?.form) {
      params = params.set('form', query.form);
    }
    if (query?.payment_status) {
      params = params.set('payment_status', query.payment_status);
    }
    if (query?.application_no) {
      params = params.set('application_no', query.application_no);
    }
    if (page_size) {
      params = params.set('page_size', page_size.toString());
    }
    if (page) {
      params = params.set('page', page.toString());
    }

    return this.http.get<ApplicationListResponse>(baseUrl, { params });
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

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PaymentDashboardDto,
  PaymentDetailDto,
  PaymentsListResponseDto,
} from '../pages/payment-record/payment-record.types';

export interface GetPaymentsQuery {
  ordering?: string;
  page?: number;
  search?: string;
  status?: string;
  /** The type's display name, e.g. "Tuition Fee". */
  payment_type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiRoot = environment.apiURL;

  getPayments(
    query: GetPaymentsQuery = {},
  ): Observable<PaymentsListResponseDto> {
    const url = `${this.apiRoot}/api/v1/payments/payments`;
    let params = new HttpParams();
    if (query.ordering) {
      params = params.set('ordering', query.ordering);
    }
    if (query.page) {
      params = params.set('page', String(query.page));
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.payment_type) {
      params = params.set('payment_type', query.payment_type);
    }
    return this.http.get<PaymentsListResponseDto>(url, { params });
  }

  getPaymentDashboard(): Observable<PaymentDashboardDto> {
    const url = `${this.apiRoot}/api/v1/payments/payments/dashboard`;
    return this.http.get<PaymentDashboardDto>(url);
  }

  getPaymentByRefId(refId: string): Observable<PaymentDetailDto> {
    const url = `${this.apiRoot}/api/v1/payments/payments/${encodeURIComponent(refId)}`;
    return this.http.get<PaymentDetailDto>(url);
  }

  downloadPaymentReceipt(refId: string): Observable<HttpResponse<Blob>> {
    const url = `${this.apiRoot}/api/v1/payments/payments/${encodeURIComponent(refId)}/receipt`;
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}

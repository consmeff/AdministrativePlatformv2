import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PaymentDetailDto,
  PaymentsListResponseDto,
} from '../pages/payment-record/payment-record.types';

export interface GetPaymentsQuery {
  ordering?: string;
  page?: number;
  search?: string;
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
    return this.http.get<PaymentsListResponseDto>(url, { params });
  }

  getPaymentByRefId(refId: string): Observable<PaymentDetailDto> {
    const url = `${this.apiRoot}/api/v1/payments/payments/${encodeURIComponent(refId)}`;
    return this.http.get<PaymentDetailDto>(url);
  }
}

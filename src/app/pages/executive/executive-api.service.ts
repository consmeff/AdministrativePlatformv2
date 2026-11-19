import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateExpensePayload,
  ExpenseDto,
  ExpenseListQuery,
  ExpenseSummaryDto,
  PaginatedResponseDto,
  StaffDto,
  StaffListQuery,
  StaffPayload,
  StudentSummaryDto,
} from './executive-api.types';

/**
 * Every endpoint the Board/Provost portals call that doesn't already exist
 * elsewhere. PROPOSED CONTRACTS: when the backend lands, adjust paths and
 * shapes here (and in executive-api.types.ts) — components don't build URLs.
 */
@Injectable({
  providedIn: 'root',
})
export class ExecutiveApiService {
  private readonly http = inject(HttpClient);
  private readonly apiRoot = `${environment.apiURL}/api/v1`;

  getStudentSummary(): Observable<StudentSummaryDto> {
    return this.http.get<StudentSummaryDto>(`${this.apiRoot}/students/summary`);
  }

  getExpenses(
    query: ExpenseListQuery = {},
  ): Observable<PaginatedResponseDto<ExpenseDto>> {
    return this.http.get<PaginatedResponseDto<ExpenseDto>>(
      `${this.apiRoot}/finance/expenses`,
      { params: toParams(query) },
    );
  }

  getExpenseSummary(): Observable<ExpenseSummaryDto> {
    return this.http.get<ExpenseSummaryDto>(
      `${this.apiRoot}/finance/expenses/summary`,
    );
  }

  createExpense(payload: CreateExpensePayload): Observable<ExpenseDto> {
    return this.http.post<ExpenseDto>(
      `${this.apiRoot}/finance/expenses`,
      payload,
    );
  }

  getStaff(
    query: StaffListQuery = {},
  ): Observable<PaginatedResponseDto<StaffDto>> {
    return this.http.get<PaginatedResponseDto<StaffDto>>(
      `${this.apiRoot}/staffs`,
      { params: toParams(query) },
    );
  }

  createStaff(payload: StaffPayload): Observable<StaffDto> {
    return this.http.post<StaffDto>(`${this.apiRoot}/staffs`, payload);
  }

  updateStaff(id: number, payload: StaffPayload): Observable<StaffDto> {
    return this.http.patch<StaffDto>(`${this.apiRoot}/staffs/${id}`, payload);
  }

  setStaffActive(id: number, isActive: boolean): Observable<StaffDto> {
    return this.http.patch<StaffDto>(`${this.apiRoot}/staffs/${id}/status`, {
      is_active: isActive,
    });
  }
}

/** Drops empty values so the backend never receives `search=` or `page=0`. */
function toParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    params = params.set(key, String(value));
  }
  return params;
}

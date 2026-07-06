import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ProfilePayload, ProfileSuccessResponse } from '../model/auth.dto';
import { DashboardinformationService } from './dashboardinformation.service';
import { DashboardInfo } from '../model/dashboard/information.dto';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_type: string;
  application_no?: string;
  matriculation_no?: string;
}

interface OtpTokenResponse {
  jwt: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  jwt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiRoot = environment.apiURL;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  private readonly jwtTokenStorageKey = 'JWT_TOKEN';
  private readonly refreshTokenStorageKey = 'REFRESH_TOKEN';
  private readonly userTypeStorageKey = 'USER_TYPE';
  private readonly applicationNumberStorageKey = 'APP_NO';
  private readonly matricNumberStorageKey = 'MATRIC_NO';
  private readonly profileEmailStorageKey = 'profile_email';
  private readonly loginRoute = '/auth/login';
  private loggedUser: string | null | undefined;
  private readonly dashInfoService = inject(DashboardinformationService);
  private dashboardInfo: DashboardInfo = {} as DashboardInfo;

  constructor() {
    this.dashInfoService.dashInfo$.subscribe((val) => {
      this.dashboardInfo = val;
    });
  }

  login(user: { username: string; password: string }): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${this.apiRoot}/api/v1/auth/login`, user)
      .pipe(
        tap((tokens) => {
          this.doLoginUser(user.username, tokens);
        }),
        map(() => true),
        catchError((error) => {
          throw error;
        }),
      );
  }

  create(payload: ProfilePayload): Observable<ProfileSuccessResponse> {
    return this.http.post<ProfileSuccessResponse>(
      `${this.apiRoot}/api/v1/auth/signup`,
      payload,
      { headers: this.headers },
    );
  }

  verifyOtp(otpObj: Record<string, unknown>): Observable<boolean> {
    return this.http
      .post<OtpTokenResponse>(
        `${this.apiRoot}/api/v1/auth/signup/verify-otp`,
        otpObj,
      )
      .pipe(
        tap((responseObj) => {
          const username = sessionStorage.getItem('profile_email');
          this.storeTokenFromOTP(username!, responseObj);
        }),
        map(() => true),
        catchError(() => {
          return of(false);
        }),
      );
  }

  verifyEmail(emailObj: Record<string, unknown>): Observable<boolean> {
    return this.http
      .post(`${this.apiRoot}/api/v1/auth/password/forgot`, emailObj)
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  updatePassword(otpObj: Record<string, unknown>): Observable<boolean> {
    return this.http
      .post(`${this.apiRoot}/api/v1/auth/password/reset`, otpObj, {
        headers: this.headers,
      })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  storeTokenFromOTP(username: string, token: OtpTokenResponse) {
    this.loggedUser = username;
    sessionStorage.setItem(this.jwtTokenStorageKey, token.jwt);
    sessionStorage.setItem(this.refreshTokenStorageKey, token.refreshToken);
  }

  storeAppNo(application_no: string) {
    sessionStorage.setItem(this.applicationNumberStorageKey, application_no);
  }

  storeMatricNo(matric_no: string) {
    sessionStorage.setItem(this.matricNumberStorageKey, matric_no);
  }

  storeRole(user_type: string) {
    sessionStorage.setItem(this.userTypeStorageKey, user_type);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logoutToLogin();
      return throwError(() => new Error('Refresh token is missing.'));
    }

    return this.http
      .post<RefreshTokenResponse>(`${this.apiRoot}/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((tokens: RefreshTokenResponse) => {
          this.storeJwtToken(tokens.jwt);
        }),
      );
  }

  getCurrentUserProfile(): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiRoot}/api/v1/auth/me`);
  }

  logoutToLogin(): void {
    this.clearSessionData();
    void this.router.navigateByUrl(this.loginRoute);
  }

  private getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenStorageKey);
  }

  private storeJwtToken(jwt: string): void {
    sessionStorage.setItem(this.jwtTokenStorageKey, jwt);
  }

  getJwtToken(): string | null {
    return sessionStorage.getItem(this.jwtTokenStorageKey);
  }

  private storeTokens(tokens: LoginResponse): void {
    sessionStorage.setItem(this.jwtTokenStorageKey, tokens.access_token);
    sessionStorage.setItem(this.refreshTokenStorageKey, tokens.refresh_token);
  }

  private clearSessionData(): void {
    sessionStorage.removeItem(this.jwtTokenStorageKey);
    sessionStorage.removeItem(this.refreshTokenStorageKey);
    sessionStorage.removeItem(this.userTypeStorageKey);
    sessionStorage.removeItem(this.applicationNumberStorageKey);
    sessionStorage.removeItem(this.matricNumberStorageKey);
    sessionStorage.removeItem(this.profileEmailStorageKey);
    this.loggedUser = null;
  }

  private doLoginUser(username: string, tokens: LoginResponse): void {
    if (username !== '') {
      this.dashboardInfo.username = username;
      this.dashboardInfo.role = tokens.user_type;
      this.dashInfoService.setdashInfo(this.dashboardInfo);
    }
    this.loggedUser = username;
    this.storeTokens(tokens);
    this.storeRole(tokens.user_type);
    if (tokens.application_no) {
      this.storeAppNo(tokens.application_no);
    }
    if (tokens.matriculation_no) {
      this.storeMatricNo(tokens.matriculation_no);
    }
  }
}

import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
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
  apiRoot = environment.apiURL;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  private loggedUser: string | null | undefined;
  dashInfoService = inject(DashboardinformationService);
  _dash: DashboardInfo = {} as DashboardInfo;
  constructor() {
    this.dashInfoService.dashInfo$.subscribe((val) => {
      this._dash = val;
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
    sessionStorage.setItem(this.JWT_TOKEN, token.jwt);
    sessionStorage.setItem(this.REFRESH_TOKEN, token.refreshToken);
  }

  storeAppNo(application_no: string) {
    sessionStorage.setItem('APP_NO', application_no);
  }
  storeMatricNo(matric_no: string) {
    sessionStorage.setItem('MATRIC_NO', matric_no);
  }

  storeRole(user_type: string) {
    sessionStorage.setItem('USER_TYPE', user_type);
  }

  refreshToken() {
    return this.http
      .post<RefreshTokenResponse>(`${this.apiRoot}/refresh`, {
        refreshToken: this.getRefreshToken(),
      })
      .pipe(
        tap((tokens: RefreshTokenResponse) => {
          this.storeJwtToken(tokens.jwt);
        }),
      );
  }

  private getRefreshToken() {
    return sessionStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeJwtToken(jwt: string) {
    sessionStorage.setItem(this.JWT_TOKEN, jwt);
  }

  getJwtToken() {
    return sessionStorage.getItem(this.JWT_TOKEN);
  }

  private storeTokens(tokens: LoginResponse) {
    sessionStorage.setItem(this.JWT_TOKEN, tokens.access_token);
    sessionStorage.setItem(this.REFRESH_TOKEN, tokens.refresh_token);
  }

  private removeTokens() {
    sessionStorage.removeItem(this.JWT_TOKEN);
    sessionStorage.removeItem(this.REFRESH_TOKEN);
  }

  private doLoginUser(username: string, tokens: LoginResponse) {
    if (username != '') {
      this._dash.username = username;
      this.dashInfoService.setdashInfo(this._dash);
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

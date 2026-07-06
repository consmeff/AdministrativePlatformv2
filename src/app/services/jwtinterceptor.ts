import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface RefreshTokenResponse {
  jwt: string;
}

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isRefreshRequest = req.url.includes('/refresh');
  const isAuthenticationRequest = req.url.includes('/api/v1/auth/');
  const addToken = (request: typeof req, token: string | null) =>
    token === null
      ? request
      : request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });

  const handle401Error = (request: typeof req) => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((token: RefreshTokenResponse) => {
          isRefreshing = false;
          refreshTokenSubject.next(token.jwt);
          return next(addToken(request, token.jwt));
        }),
        catchError((error) => {
          isRefreshing = false;
          authService.logoutToLogin();
          return throwError(() => error);
        }),
      );
    }

    return refreshTokenSubject.pipe(
      filter((token) => token != null),
      take(1),
      switchMap((jwt) => {
        return next(addToken(request, jwt));
      }),
    );
  };

  const jwtToken = authService.getJwtToken();
  const modifiedReq = addToken(req, jwtToken);

  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshRequest) {
        authService.logoutToLogin();
        return throwError(() => error);
      }

      if (isAuthenticationRequest) {
        return throwError(() => error);
      }

      if (jwtToken === null) {
        authService.logoutToLogin();
        return throwError(() => error);
      }

      if (error.status === 401) {
        return handle401Error(modifiedReq);
      }

      return throwError(() => error);
    }),
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Flags and subjects
  let isRefreshing = false;
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // Clone and add token to the request
  const addToken = (request: typeof req, token: string | null) =>
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

  // Handle 401 errors and refresh the token
  const handle401Error = (request: typeof req) => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((token: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(token.jwt);
          return next(addToken(request, token.jwt));
        }),
        catchError((error) => {
          isRefreshing = false;
          return throwError(() => error);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          return next(addToken(request, jwt));
        })
      );
    }
  };

  // Main request handling
  const jwtToken = authService.getJwtToken();

  const modifiedReq = jwtToken ? addToken(req, jwtToken) : req;

  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return handle401Error(modifiedReq);
      }
      return throwError(() => error);
    })
  );
};

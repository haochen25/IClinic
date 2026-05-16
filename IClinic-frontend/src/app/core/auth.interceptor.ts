import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  const handleAuthError = (source: Observable<HttpEvent<unknown>>): Observable<HttpEvent<unknown>> =>
    source.pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          auth.clearSession();
          void router.navigateByUrl('/login');
        }
        return throwError(() => err);
      }),
    );

  if (!token || req.headers.has('Authorization')) {
    return handleAuthError(next(req));
  }
  return handleAuthError(next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ));
};

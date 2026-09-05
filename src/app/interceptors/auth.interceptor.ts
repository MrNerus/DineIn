import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUser();
  const token = currentUser?.token;

  let modifiedReq = req;

  // Automatically attach session token and credentials to API requests (except login)
  if (req.url.includes('/api/') && !req.url.includes('/api/login.php')) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Session-Token'] = token;
    }

    modifiedReq = req.clone({
      setHeaders: headers,
      withCredentials: true
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/api/login.php')
      ) {
        console.warn('Unauthorized API access (401). Ending session and redirecting to login.');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};


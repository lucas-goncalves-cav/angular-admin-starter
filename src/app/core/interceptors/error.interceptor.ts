import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        toast.error('Your session has expired. Please sign in again.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (error.status >= 500) {
        toast.error('Something went wrong on the server. Try again later.');
      } else {
        toast.error(error.error?.detail ?? error.message ?? 'Unexpected error.');
      }

      return throwError(() => error);
    })
  );
};

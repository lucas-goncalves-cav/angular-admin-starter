import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export function roleGuard(roles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (auth.hasRole(roles)) {
      return true;
    }

    toast.error('You do not have permission to access this page.');

    return router.createUrlTree(['/dashboard']);
  };
}

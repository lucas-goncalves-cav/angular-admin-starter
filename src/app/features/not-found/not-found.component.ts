import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p class="text-6xl font-bold text-brand-600 dark:text-brand-400">404</p>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p class="max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <a routerLink="/dashboard" class="btn-primary">Back to dashboard</a>
    </div>
  `
})
export class NotFoundComponent {}

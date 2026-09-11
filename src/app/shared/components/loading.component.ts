import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-10 text-slate-500 dark:text-slate-400">
      <span class="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400"></span>
      <p class="text-sm">{{ message() }}</p>
    </div>
  `
})
export class LoadingComponent {
  readonly message = input('Loading...');
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        @if (breadcrumbs().length) {
          <nav class="mb-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
              @if (crumb.route && !last) {
                <a [routerLink]="crumb.route" class="transition hover:text-brand-600 dark:hover:text-brand-400">{{ crumb.label }}</a>
              } @else {
                <span [class.font-medium]="last" [class.text-slate-700]="last" [class.dark:text-slate-200]="last">{{ crumb.label }}</span>
              }
              @if (!last) {
                <app-icon name="chevronRight" [size]="14" />
              }
            }
          </nav>
        }
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">{{ title() }}</h1>
        @if (description()) {
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ description() }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content />
      </div>
    </header>
  `
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly breadcrumbs = input<Breadcrumb[]>([]);
}

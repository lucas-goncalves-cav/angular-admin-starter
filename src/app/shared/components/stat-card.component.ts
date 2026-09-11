import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card p-5">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ label() }}</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{{ value() }}</p>
        </div>
        <span class="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <app-icon [name]="icon()" />
        </span>
      </div>
      @if (change() !== null) {
        <p class="mt-3 flex items-center gap-1 text-xs font-medium" [class]="changeClass()">
          <app-icon [name]="change()! >= 0 ? 'chevronUp' : 'chevronDown'" [size]="14" />
          {{ formattedChange() }} vs previous period
        </p>
      }
    </article>
  `
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input('dashboard');
  readonly change = input<number | null>(null);

  changeClass(): string {
    return (this.change() ?? 0) >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';
  }

  formattedChange(): string {
    const value = this.change() ?? 0;

    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }
}

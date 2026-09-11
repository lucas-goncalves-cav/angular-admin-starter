import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartPoint } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="space-y-3">
      @for (bar of bars(); track bar.label) {
        <li>
          <div class="mb-1 flex items-center justify-between text-xs">
            <span class="truncate text-slate-600 dark:text-slate-300">{{ bar.label }}</span>
            <span class="font-medium text-slate-800 dark:text-slate-100">{{ bar.value.toLocaleString('en-US') }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div class="h-full rounded-full bg-brand-600 transition-all dark:bg-brand-500" [style.width.%]="bar.percentage"></div>
          </div>
        </li>
      }
    </ul>
  `
})
export class BarChartComponent {
  readonly data = input.required<ChartPoint[]>();

  readonly bars = computed(() => {
    const max = Math.max(...this.data().map((point) => point.value), 1);

    return this.data().map((point) => ({ ...point, percentage: (point.value / max) * 100 }));
  });
}

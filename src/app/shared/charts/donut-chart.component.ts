import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartPoint } from '../../core/services/dashboard.service';

const COLORS = ['#1c44f5', '#588eff', '#8eb6ff', '#bcd3ff'];
const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 160 160" class="h-40 w-40 -rotate-90" role="img" aria-label="Distribution chart">
        <circle cx="80" cy="80" [attr.r]="radius" fill="none" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="18" />
        @for (slice of slices(); track slice.label) {
          <circle
            cx="80"
            cy="80"
            [attr.r]="radius"
            fill="none"
            [attr.stroke]="slice.color"
            stroke-width="18"
            [attr.stroke-dasharray]="slice.dashArray"
            [attr.stroke-dashoffset]="slice.dashOffset"
          />
        }
      </svg>

      <ul class="flex-1 space-y-2 text-sm">
        @for (slice of slices(); track slice.label) {
          <li class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span class="h-2.5 w-2.5 rounded-full" [style.background]="slice.color"></span>
              {{ slice.label }}
            </span>
            <span class="font-medium text-slate-800 dark:text-slate-100">{{ slice.percentage.toFixed(1) }}%</span>
          </li>
        }
      </ul>
    </div>
  `
})
export class DonutChartComponent {
  readonly data = input.required<ChartPoint[]>();

  readonly radius = RADIUS;

  readonly slices = computed(() => {
    const total = this.data().reduce((sum, point) => sum + point.value, 0) || 1;
    let consumed = 0;

    return this.data().map((point, index) => {
      const percentage = (point.value / total) * 100;
      const length = (percentage / 100) * CIRCUMFERENCE;
      const slice = {
        label: point.label,
        value: point.value,
        percentage,
        color: COLORS[index % COLORS.length],
        dashArray: `${length} ${CIRCUMFERENCE - length}`,
        dashOffset: -consumed
      };

      consumed += length;

      return slice;
    });
  });
}

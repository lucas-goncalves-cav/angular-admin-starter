import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartPoint } from '../../core/services/dashboard.service';

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 48 };

@Component({
  selector: 'app-line-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="viewBox" class="h-56 w-full" role="img" [attr.aria-label]="label()">
      @for (tick of ticks(); track tick.value) {
        <line [attr.x1]="padding.left" [attr.x2]="width - padding.right" [attr.y1]="tick.y" [attr.y2]="tick.y" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="1" />
        <text [attr.x]="padding.left - 8" [attr.y]="tick.y + 4" text-anchor="end" class="fill-slate-400 text-[10px]">{{ tick.label }}</text>
      }

      <path [attr.d]="areaPath()" class="fill-brand-500/10" />
      <path [attr.d]="linePath()" fill="none" class="stroke-brand-600 dark:stroke-brand-400" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

      @for (point of coordinates(); track point.label) {
        <circle [attr.cx]="point.x" [attr.cy]="point.y" r="3" class="fill-brand-600 dark:fill-brand-400" />
        <text [attr.x]="point.x" [attr.y]="height - 8" text-anchor="middle" class="fill-slate-400 text-[10px]">{{ point.label }}</text>
      }
    </svg>
  `
})
export class LineChartComponent {
  readonly data = input.required<ChartPoint[]>();
  readonly label = input('Line chart');

  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly padding = PADDING;
  readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;

  readonly maxValue = computed(() => Math.max(...this.data().map((point) => point.value), 1));

  readonly coordinates = computed(() => {
    const points = this.data();
    const usableWidth = WIDTH - PADDING.left - PADDING.right;
    const usableHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const step = points.length > 1 ? usableWidth / (points.length - 1) : 0;

    return points.map((point, index) => ({
      label: point.label,
      value: point.value,
      x: PADDING.left + step * index,
      y: PADDING.top + usableHeight - (point.value / this.maxValue()) * usableHeight
    }));
  });

  readonly ticks = computed(() => {
    const usableHeight = HEIGHT - PADDING.top - PADDING.bottom;

    return Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;

      return {
        value: Math.round(this.maxValue() * (1 - ratio)),
        label: this.compact(Math.round(this.maxValue() * (1 - ratio))),
        y: PADDING.top + usableHeight * ratio
      };
    });
  });

  linePath(): string {
    return this.coordinates()
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(' ');
  }

  areaPath(): string {
    const points = this.coordinates();

    if (points.length === 0) {
      return '';
    }

    const baseline = HEIGHT - PADDING.bottom;

    return `${this.linePath()} L${points[points.length - 1].x.toFixed(1)},${baseline} L${points[0].x.toFixed(1)},${baseline} Z`;
  }

  private compact(value: number): string {
    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value);
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DashboardData, DashboardPeriod, DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { BarChartComponent } from '../../shared/charts/bar-chart.component';
import { DonutChartComponent } from '../../shared/charts/donut-chart.component';
import { LineChartComponent } from '../../shared/charts/line-chart.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { StatCardComponent } from '../../shared/components/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    SkeletonComponent,
    LineChartComponent,
    BarChartComponent,
    DonutChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Dashboard" description="Business overview for the selected period.">
      <div class="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
        @for (option of periods; track option.value) {
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            [class]="option.value === period() ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'"
            (click)="changePeriod(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        @for (placeholder of [1, 2, 3, 4, 5]; track placeholder) {
          <div class="card p-5"><app-skeleton [count]="2" /></div>
        }
      </div>
      <div class="mt-4 card p-5"><app-skeleton [count]="8" /></div>
    } @else if (data()) {
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        @for (metric of data()!.metrics; track metric.key) {
          <app-stat-card [label]="metric.label" [value]="metric.value" [icon]="metric.icon" [change]="metric.change" />
        }
      </section>

      <section class="mt-4 grid gap-4 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-2">
          <h2 class="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Revenue</h2>
          <app-line-chart [data]="data()!.revenue" label="Revenue over time" />
        </div>

        <div class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Orders by status</h2>
          <app-donut-chart [data]="data()!.ordersByStatus" />
        </div>
      </section>

      <section class="mt-4 grid gap-4 lg:grid-cols-2">
        <div class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Top products</h2>
          <app-bar-chart [data]="data()!.topProducts" />
        </div>

        <div class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">New customers</h2>
          <app-bar-chart [data]="data()!.revenue.slice(0, 6)" />
        </div>
      </section>
    }
  `
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly toast = inject(ToastService);

  readonly periods: { label: string; value: DashboardPeriod }[] = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '12m', value: '12m' }
  ];

  readonly period = signal<DashboardPeriod>('30d');
  readonly loading = signal(true);
  readonly data = signal<DashboardData | null>(null);

  constructor() {
    this.load();
  }

  changePeriod(period: DashboardPeriod): void {
    this.period.set(period);
    this.load();
  }

  private load(): void {
    this.loading.set(true);

    this.dashboardService.load(this.period()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load dashboard data.');
      }
    });
  }
}

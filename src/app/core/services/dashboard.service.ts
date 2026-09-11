import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MockDataService } from './mock-data.service';

export type DashboardPeriod = '7d' | '30d' | '90d' | '12m';

export interface DashboardMetric {
  key: string;
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  revenue: ChartPoint[];
  ordersByStatus: ChartPoint[];
  topProducts: ChartPoint[];
}

const PERIOD_FACTOR: Record<DashboardPeriod, number> = {
  '7d': 0.25,
  '30d': 1,
  '90d': 2.8,
  '12m': 11.4
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly data = inject(MockDataService);

  load(period: DashboardPeriod): Observable<DashboardData> {
    const factor = PERIOD_FACTOR[period];
    const revenue = 128400 * factor;
    const orders = Math.round(842 * factor);
    const customers = Math.round(276 * factor);

    return of<DashboardData>({
      metrics: [
        { key: 'revenue', label: 'Revenue', value: this.currency(revenue), change: 12.4, icon: 'revenue' },
        { key: 'customers', label: 'Customers', value: customers.toLocaleString('en-US'), change: 5.1, icon: 'users' },
        { key: 'orders', label: 'Orders', value: orders.toLocaleString('en-US'), change: -2.3, icon: 'orders' },
        { key: 'ticket', label: 'Average ticket', value: this.currency(revenue / Math.max(orders, 1)), change: 3.7, icon: 'ticket' },
        { key: 'conversion', label: 'Conversion', value: '4.8%', change: 0.6, icon: 'conversion' }
      ],
      revenue: this.revenueSeries(period, factor),
      ordersByStatus: [
        { label: 'Paid', value: Math.round(orders * 0.62) },
        { label: 'Pending', value: Math.round(orders * 0.18) },
        { label: 'Shipped', value: Math.round(orders * 0.14) },
        { label: 'Cancelled', value: Math.round(orders * 0.06) }
      ],
      topProducts: this.data.products
        .slice(0, 5)
        .map((product, index) => ({ label: product.name, value: Math.round((260 - index * 38) * factor) }))
    }).pipe(delay(500));
  }

  private revenueSeries(period: DashboardPeriod, factor: number): ChartPoint[] {
    const labels =
      period === '12m'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : period === '90d'
          ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12']
          : period === '30d'
            ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return labels.map((label, index) => ({
      label,
      value: Math.round((18000 + Math.sin(index * 0.9) * 5200 + index * 900) * (factor / labels.length) * 4)
    }));
  }

  private currency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }
}

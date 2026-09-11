import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (row of rows(); track $index) {
      <div class="mb-3 h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" [style.width]="widthFor($index)"></div>
    }
  `
})
export class SkeletonComponent {
  readonly count = input(4);

  rows(): number[] {
    return Array.from({ length: this.count() }, (_, index) => index);
  }

  widthFor(index: number): string {
    const widths = ['100%', '92%', '84%', '96%', '78%'];

    return widths[index % widths.length];
  }
}

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <p class="text-slate-500 dark:text-slate-400">
        Showing {{ rangeStart() }} to {{ rangeEnd() }} of {{ totalItems() }} entries
      </p>
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>Rows</span>
          <select class="form-input w-20 py-1" [value]="pageSize()" (change)="onPageSizeChange($event)">
            @for (size of pageSizes; track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
        </label>
        <button type="button" class="btn-secondary px-2 py-1" [disabled]="page() <= 1" (click)="pageChange.emit(page() - 1)" aria-label="Previous page">
          <app-icon name="chevronLeft" [size]="16" />
        </button>
        <span class="text-slate-600 dark:text-slate-300">{{ page() }} / {{ totalPages() }}</span>
        <button type="button" class="btn-secondary px-2 py-1" [disabled]="page() >= totalPages()" (click)="pageChange.emit(page() + 1)" aria-label="Next page">
          <app-icon name="chevronRight" [size]="16" />
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly pageSizes = [10, 20, 50];

  readonly rangeStart = computed(() => (this.totalItems() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.totalItems()));

  onPageSizeChange(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}

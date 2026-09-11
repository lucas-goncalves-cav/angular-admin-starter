import { ChangeDetectionStrategy, Component, TemplateRef, contentChild, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableColumn } from '../../core/models';
import { EmptyStateComponent } from './empty-state.component';
import { IconComponent } from './icon.component';
import { SkeletonComponent } from './skeleton.component';

export interface SortState {
  sortBy: string;
  sortDescending: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, EmptyStateComponent, IconComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          <tr>
            @for (column of columns(); track column.key) {
              <th scope="col" class="px-4 py-3 font-medium" [class]="alignClass(column.align)">
                @if (column.sortable) {
                  <button type="button" class="inline-flex items-center gap-1 transition hover:text-slate-700 dark:hover:text-slate-200" (click)="toggleSort(column.key)">
                    {{ column.label }}
                    @if (sort()?.sortBy === column.key) {
                      <app-icon [name]="sort()!.sortDescending ? 'chevronDown' : 'chevronUp'" [size]="14" />
                    }
                  </button>
                } @else {
                  {{ column.label }}
                }
              </th>
            }
            @if (actions()) {
              <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          @if (loading()) {
            <tr>
              <td [attr.colspan]="columnCount()" class="px-4 py-6">
                <app-skeleton [count]="6" />
              </td>
            </tr>
          } @else {
            @for (row of rows(); track trackKey(row)) {
              <tr class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                @for (column of columns(); track column.key) {
                  <td class="px-4 py-3 text-slate-700 dark:text-slate-300" [class]="alignClass(column.align)">
                    @if (cellTemplate()) {
                      <ng-container
                        [ngTemplateOutlet]="cellTemplate()!"
                        [ngTemplateOutletContext]="{ $implicit: row, column: column }"
                      />
                    } @else {
                      {{ display(row, column) }}
                    }
                  </td>
                }
                @if (actions()) {
                  <td class="px-4 py-3 text-right">
                    <ng-container [ngTemplateOutlet]="actions()!" [ngTemplateOutletContext]="{ $implicit: row }" />
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columnCount()">
                  <app-empty-state [title]="emptyTitle()" [description]="emptyDescription()" />
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `
})
export class DataTableComponent<T extends { id: string }> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input(false);
  readonly sort = input<SortState | null>(null);
  readonly emptyTitle = input('No records found');
  readonly emptyDescription = input('Try adjusting the filters or create a new record.');
  readonly sortChange = output<SortState>();

  readonly actions = contentChild<TemplateRef<{ $implicit: T }>>('actions');
  readonly cellTemplate = contentChild<TemplateRef<{ $implicit: T; column: TableColumn<T> }>>('cell');

  columnCount(): number {
    return this.columns().length + (this.actions() ? 1 : 0);
  }

  trackKey(row: T): string {
    return row.id;
  }

  display(row: T, column: TableColumn<T>): string {
    if (column.value) {
      return column.value(row);
    }

    return String((row as Record<string, unknown>)[column.key] ?? '');
  }

  alignClass(align?: TableColumn<T>['align']): string {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  }

  toggleSort(key: string): void {
    const current = this.sort();

    this.sortChange.emit({
      sortBy: key,
      sortDescending: current?.sortBy === key ? !current.sortDescending : false
    });
  }
}

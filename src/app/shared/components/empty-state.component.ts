import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span class="rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <app-icon [name]="icon()" [size]="28" />
      </span>
      <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">{{ title() }}</h3>
      <p class="max-w-sm text-sm text-slate-500 dark:text-slate-400">{{ description() }}</p>
      <ng-content />
    </div>
  `
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nothing here yet');
  readonly description = input('There is no data to display for the selected filters.');
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        class="absolute inset-0 h-full w-full cursor-default bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        (click)="closed.emit()"
      ></button>
      <div
        class="card relative z-10 w-full max-w-lg p-6"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ title() }}</h2>
          <button type="button" class="rounded p-1 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200" (click)="closed.emit()" aria-label="Close">
            <app-icon name="close" [size]="18" />
          </button>
        </div>
        <ng-content />
      </div>
    </div>
  `
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly closed = output<void>();
}

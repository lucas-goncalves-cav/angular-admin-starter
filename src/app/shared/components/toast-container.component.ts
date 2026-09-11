import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../core/services/toast.service';
import { IconComponent } from './icon.component';

const STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
  error: 'border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200',
  warning: 'border-amber-500/40 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  info: 'border-brand-500/40 bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-200'
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg" [class]="styleFor(toast.type)" role="status">
          <span class="mt-0.5"><app-icon [name]="toast.type === 'success' ? 'chevronUp' : 'alert'" [size]="16" /></span>
          <p class="flex-1">{{ toast.message }}</p>
          <button type="button" class="opacity-60 transition hover:opacity-100" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">
            <app-icon name="close" [size]="14" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  styleFor(type: ToastType): string {
    return STYLES[type];
  }
}

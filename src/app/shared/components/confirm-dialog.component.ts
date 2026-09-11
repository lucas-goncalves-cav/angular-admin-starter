import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="title()" (closed)="cancelled.emit()">
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ message() }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="btn-secondary" (click)="cancelled.emit()">{{ cancelLabel() }}</button>
        <button type="button" class="btn-danger" (click)="confirmed.emit()">{{ confirmLabel() }}</button>
      </div>
    </app-modal>
  `
})
export class ConfirmDialogComponent {
  readonly title = input('Are you sure?');
  readonly message = input('This action cannot be undone.');
  readonly confirmLabel = input('Delete');
  readonly cancelLabel = input('Cancel');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}

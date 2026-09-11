import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserPayload, UserRole } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="user() ? 'Edit user' : 'New user'" (closed)="cancelled.emit()">
      <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label class="form-label" for="name">Name</label>
          <input id="name" class="form-input" formControlName="name" />
          @if (invalid('name')) {
            <p class="form-error">Name is required.</p>
          }
        </div>

        <div>
          <label class="form-label" for="email">Email</label>
          <input id="email" type="email" class="form-input" formControlName="email" />
          @if (invalid('email')) {
            <p class="form-error">A valid email is required.</p>
          }
        </div>

        <div>
          <label class="form-label" for="role">Role</label>
          <select id="role" class="form-input" formControlName="role">
            @for (role of roles; track role) {
              <option [value]="role">{{ role }}</option>
            }
          </select>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" formControlName="active" class="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Active
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">Save</button>
        </div>
      </form>
    </app-modal>
  `
})
export class UserFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly user = input<User | null>(null);
  readonly saving = input(false);
  readonly saved = output<UserPayload>();
  readonly cancelled = output<void>();

  readonly roles: UserRole[] = ['admin', 'manager', 'viewer'];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['viewer' as UserRole, Validators.required],
    active: [true]
  });

  constructor() {
    queueMicrotask(() => {
      const current = this.user();

      if (current) {
        this.form.patchValue({
          name: current.name,
          email: current.email,
          role: current.role,
          active: current.active
        });
      }
    });
  }

  invalid(control: 'name' | 'email'): boolean {
    const field = this.form.controls[control];

    return field.invalid && (field.dirty || field.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.saved.emit(this.form.getRawValue());
  }
}

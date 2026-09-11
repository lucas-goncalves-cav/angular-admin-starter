import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">A</span>
            <span class="text-base font-semibold text-slate-900 dark:text-white">Admin Starter</span>
          </div>
          <button type="button" class="btn-secondary px-2 py-1" (click)="theme.toggle()" aria-label="Toggle theme">
            <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
          </button>
        </div>

        <div class="card p-6">
          <h1 class="text-xl font-semibold text-slate-900 dark:text-white">Sign in</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Use one of the demo accounts below to explore the starter.</p>

          <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="form-label" for="email">Email</label>
              <input id="email" type="email" class="form-input" formControlName="email" autocomplete="username" />
              @if (showError('email')) {
                <p class="form-error">A valid email is required.</p>
              }
            </div>

            <div>
              <label class="form-label" for="password">Password</label>
              <input id="password" type="password" class="form-input" formControlName="password" autocomplete="current-password" />
              @if (showError('password')) {
                <p class="form-error">Password must have at least 6 characters.</p>
              }
            </div>

            <button type="submit" class="btn-primary w-full" [disabled]="submitting()">
              @if (submitting()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              }
              Sign in
            </button>
          </form>

          <div class="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <p class="mb-2 font-medium">Demo accounts</p>
            <ul class="space-y-1">
              @for (account of demoAccounts; track account.email) {
                <li>
                  <button type="button" class="underline decoration-dotted underline-offset-2 transition hover:text-brand-600" (click)="fill(account.email, account.password)">
                    {{ account.email }} / {{ account.password }}
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly theme = inject(ThemeService);
  readonly submitting = signal(false);

  readonly demoAccounts = [
    { email: 'admin@demo.com', password: 'admin123' },
    { email: 'manager@demo.com', password: 'manager123' },
    { email: 'viewer@demo.com', password: 'viewer123' }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@demo.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]]
  });

  showError(control: 'email' | 'password'): boolean {
    const field = this.form.controls[control];

    return field.invalid && (field.dirty || field.touched);
  }

  fill(email: string, password: string): void {
    this.form.setValue({ email, password });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.submitting.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (session) => {
        this.submitting.set(false);
        this.toast.success(`Welcome back, ${session.user.name}.`);
        void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard');
      },
      error: (error: Error) => {
        this.submitting.set(false);
        this.toast.error(error.message);
      }
    });
  }
}

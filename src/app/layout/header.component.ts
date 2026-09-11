import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { IconComponent } from '../shared/components/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6 dark:border-slate-800 dark:bg-slate-900/80">
      <button type="button" class="btn-secondary px-2 py-1 lg:hidden" (click)="menuToggled.emit()" aria-label="Toggle navigation">
        <app-icon name="menu" [size]="18" />
      </button>

      <div class="ml-auto flex items-center gap-2">
        <button type="button" class="btn-secondary px-2 py-1" (click)="theme.toggle()" [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
        </button>

        <div class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-800">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {{ initials() }}
          </span>
          <div class="hidden text-left sm:block">
            <p class="text-sm font-medium leading-tight text-slate-800 dark:text-slate-100">{{ auth.currentUser()?.name }}</p>
            <p class="text-xs capitalize leading-tight text-slate-500 dark:text-slate-400">{{ auth.currentUser()?.role }}</p>
          </div>
        </div>

        <button type="button" class="btn-secondary px-2 py-1" (click)="auth.logout()" aria-label="Sign out">
          <app-icon name="logout" [size]="18" />
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly menuToggled = output<void>();

  initials(): string {
    const name = this.auth.currentUser()?.name ?? '';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}

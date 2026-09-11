import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU } from '../core/config/menu.config';
import { AuthService } from '../core/services/auth.service';
import { UserRole } from '../core/models';
import { IconComponent } from '../shared/components/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900"
      [class.-translate-x-full]="!open()"
    >
      <div class="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-800">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">A</span>
        <span class="text-sm font-semibold text-slate-900 dark:text-white">Admin Starter</span>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        @for (section of sections(); track section.label) {
          <div>
            <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {{ section.label }}
            </p>
            <ul class="space-y-1">
              @for (item of section.items; track item.route) {
                <li>
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    (click)="navigated.emit()"
                  >
                    <app-icon [name]="item.icon" [size]="18" />
                    {{ item.title }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </nav>

      <div class="border-t border-slate-200 p-4 dark:border-slate-800">
        <p class="text-xs text-slate-400 dark:text-slate-500">Signed in as</p>
        <p class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ auth.currentUser()?.email }}</p>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly open = input(false);
  readonly navigated = output<void>();

  sections() {
    return MENU.map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || this.auth.hasRole(item.roles as UserRole[]))
    })).filter((section) => section.items.length > 0);
  }
}

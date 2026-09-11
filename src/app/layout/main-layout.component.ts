import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from '../core/services/loading.service';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen">
      <app-sidebar [open]="sidebarOpen()" (navigated)="sidebarOpen.set(false)" />

      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <div class="lg:pl-64">
        <app-header (menuToggled)="sidebarOpen.set(!sidebarOpen())" />

        @if (loading.isLoading()) {
          <div class="h-0.5 w-full overflow-hidden bg-brand-100 dark:bg-brand-950">
            <div class="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-brand-600"></div>
          </div>
        }

        <main class="px-4 py-6 lg:px-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  readonly loading = inject(LoadingService);
  readonly sidebarOpen = signal(false);
}

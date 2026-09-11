import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'admin-starter.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Theme>('light');

  readonly theme = this.current.asReadonly();

  initialize(): void {
    this.apply(this.readStoredTheme() ?? this.preferredTheme());
  }

  toggle(): void {
    this.apply(this.current() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.current.set(theme);
    this.document.documentElement.classList.toggle('dark', theme === 'dark');

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private browsing mode.
    }
  }

  private readStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }

  private preferredTheme(): Theme {
    const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

    return media?.matches ? 'dark' : 'light';
  }
}

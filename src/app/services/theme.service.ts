import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private readonly document = inject(DOCUMENT);
  private readonly activeTheme = signal<AppTheme>('light');

  readonly theme = this.activeTheme.asReadonly();

  initialize(): void {
    const storedTheme = this.readStoredTheme();
    this.applyTheme(storedTheme ?? 'light');
  }

  setTheme(theme: AppTheme): void {
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.activeTheme() === 'light' ? 'dark' : 'light');
  }

  private applyTheme(theme: AppTheme): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('app-theme-light', 'app-theme-dark');
    root.classList.add(`app-theme-${theme}`);
    root.style.colorScheme = theme;
    this.activeTheme.set(theme);
  }

  private readStoredTheme(): AppTheme | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      return null;
    }
    return null;
  }

  private persistTheme(theme: AppTheme): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
  }
}

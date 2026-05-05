import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusyIndicatorService } from './services/busy-indicator.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppStore } from './store/app.store';
import { ThemeService } from './services/theme.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ProgressSpinnerModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly appStore = inject(AppStore);
  private readonly busyIndicatorService = inject(BusyIndicatorService);
  private readonly themeService = inject(ThemeService);

  isLoading$: Observable<boolean>;

  constructor() {
    this.themeService.initialize();
    this.isLoading$ = this.busyIndicatorService.isLoading$;
    this.appStore.markInitialized();
  }
}

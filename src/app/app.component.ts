import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusyIndicatorComponent } from './widgets/busy-indicator/busy-indicator.component';
import { BusyIndicatorService } from './services/busy-indicator.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppStore } from './store/app.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BusyIndicatorComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly appStore = inject(AppStore);
  private readonly busyIndicatorService = inject(BusyIndicatorService);

  isLoading$: Observable<boolean>;

  constructor() {
    this.isLoading$ = this.busyIndicatorService.isLoading$;
    this.appStore.markInitialized();
  }
}

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SessionStateService } from './session-state.service';

@Injectable({
  providedIn: 'root',
})
export class BusyIndicatorService {
  private readonly sessionStateService = inject(SessionStateService);
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor() {
    this.sessionStateService.registerResetHandler(() => this.reset());
  }

  show() {
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
  }

  reset(): void {
    this.isLoading.next(false);
  }
}

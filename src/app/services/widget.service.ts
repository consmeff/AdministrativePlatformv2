import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { sidebarStateDTO } from '../model/page.dto';
import { SessionStateService } from './session-state.service';

@Injectable({
  providedIn: 'root',
})
export class WidgetService {
  private readonly sessionStateService = inject(SessionStateService);
  private readonly _sidebarState = new BehaviorSubject<sidebarStateDTO>({
    isvisible: true,
  });
  public sidebarState$ = this._sidebarState.asObservable();

  constructor() {
    this.sessionStateService.registerResetHandler(() => this.reset());
  }

  setSidebarState(state: sidebarStateDTO) {
    this._sidebarState.next(state);
  }

  reset(): void {
    this._sidebarState.next({ isvisible: true });
  }
}

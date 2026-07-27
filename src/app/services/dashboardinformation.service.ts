import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashboardInfo } from '../model/dashboard/information.dto';
import { SessionStateService } from './session-state.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardinformationService {
  private readonly sessionStateService = inject(SessionStateService);
  private readonly _dashInfo = new BehaviorSubject<DashboardInfo>(
    {} as DashboardInfo,
  );
  public dashInfo$ = this._dashInfo.asObservable();

  constructor() {
    this.sessionStateService.registerResetHandler(() => this.reset());
  }

  setdashInfo(val: DashboardInfo) {
    this._dashInfo.next(val);
  }

  reset(): void {
    this._dashInfo.next({} as DashboardInfo);
  }
}

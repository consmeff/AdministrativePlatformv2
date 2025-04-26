import { Injectable } from '@angular/core';
import { DashboardInfo } from '../model/dashboard/information.dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardinformationService {


   private readonly _dashInfo=new BehaviorSubject<DashboardInfo>({} as DashboardInfo);
    public dashInfo$=this._dashInfo.asObservable();

  constructor() { }

  setdashInfo(val:DashboardInfo){
    this._dashInfo.next(val);
  }
}

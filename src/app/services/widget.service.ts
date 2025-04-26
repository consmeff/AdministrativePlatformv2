import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { sidebarStateDTO } from '../model/page.dto';


@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  
  
  private readonly _sidebarState=new BehaviorSubject<sidebarStateDTO>({isvisible:true});
  public sidebarState$=this._sidebarState.asObservable();

  constructor() {   }

  setSidebarState(state:sidebarStateDTO){
    this._sidebarState.next(state);
  }
}

import { Component, inject } from '@angular/core';
import { WidgetService } from '../../services/widget.service';
import { DashboardinformationService } from '../../services/dashboardinformation.service';
import { DashboardInfo } from '../../model/dashboard/information.dto';
import { sidebarStateDTO } from '../../model/page.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  sidebarVisible = false;
  _widgetService = inject(WidgetService);
  dashInfoService = inject(DashboardinformationService);
  dashinfo: DashboardInfo = {} as DashboardInfo;
  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });

    this.dashInfoService.dashInfo$.subscribe((val) => {
      if (val) {
        this.dashinfo = val;
      }
    });
  }

  toggleSidebar() {
    this._widgetService.setSidebarState({ isvisible: true });
  }
}

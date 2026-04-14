import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WidgetService } from '../../services/widget.service';
import { sidebarStateDTO } from '../../model/page.dto';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  sidebarVisible = false;
  _widgetService = inject(WidgetService);
  router = inject(Router);
  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  onSidebarHide() {
    this._widgetService.setSidebarState({ isvisible: false });
  }
  close() {
    this._widgetService.setSidebarState({ isvisible: false });
  }

  logOut() {
    sessionStorage.clear();
    setTimeout(() => {
      this.router.navigateByUrl('/auth/login');
    }, 1000);
  }
}

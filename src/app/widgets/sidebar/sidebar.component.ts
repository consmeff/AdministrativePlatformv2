import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Params, Router, RouterModule } from '@angular/router';
import { WidgetService } from '../../services/widget.service';
import { sidebarStateDTO } from '../../model/page.dto';

interface SidebarSubMenuItem {
  label: string;
  route: string;
  queryParams?: Params;
}

interface SidebarMenuItem {
  label: string;
  iconClass: string;
  route: string;
  exact?: boolean;
  children?: SidebarSubMenuItem[];
}

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
  openGroupRoute: string | null = null;
  readonly menuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      iconClass: 'bi bi-house',
      route: '/pages/dashboard',
      exact: true,
    },
    {
      label: 'Applications',
      iconClass: 'bi bi-people',
      route: '/pages/applicants',
      children: [
        {
          label: 'OND',
          route: '/pages/applicants',
          queryParams: { level: 'ond' },
        },
        {
          label: 'HND',
          route: '/pages/applicants',
          queryParams: { level: 'hnd' },
        },
      ],
    },
    {
      label: 'Admissions',
      iconClass: 'bi bi-card-list',
      route: '/pages/admissions',
    },
    {
      label: 'Payment Records',
      iconClass: 'bi bi-wallet2',
      route: '/pages/payment-records',
    },
  ];

  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });
    this.openGroupRoute = this.getDefaultOpenGroup();
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

  toggleGroup(item: SidebarMenuItem) {
    if (!item.children?.length) {
      return;
    }
    this.openGroupRoute =
      this.openGroupRoute === item.route ? null : item.route;
  }

  isGroupOpen(item: SidebarMenuItem): boolean {
    if (!item.children?.length) {
      return false;
    }
    return this.openGroupRoute === item.route;
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  isSubmenuActive(item: SidebarSubMenuItem): boolean {
    const currentTree = this.router.parseUrl(this.router.url);
    const currentPath = currentTree.root.children['primary']?.segments
      .map((segment) => segment.path)
      .join('/');
    const normalizedCurrentPath = currentPath ? `/${currentPath}` : '';
    const expectedLevel = item.queryParams?.['level'];
    const currentLevel = currentTree.queryParams['level'];

    if (!normalizedCurrentPath.startsWith(item.route)) {
      return false;
    }
    if (!expectedLevel) {
      return true;
    }
    return (
      String(currentLevel ?? '').toLowerCase() ===
      String(expectedLevel).toLowerCase()
    );
  }

  private getDefaultOpenGroup(): string | null {
    const matched = this.menuItems.find(
      (item) => item.children?.length && this.isRouteActive(item.route),
    );
    return matched?.route ?? null;
  }

  logOut() {
    sessionStorage.clear();
    setTimeout(() => {
      this.router.navigateByUrl('/auth/login');
    }, 1000);
  }
}

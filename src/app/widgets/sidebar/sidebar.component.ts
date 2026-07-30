import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Params, Router, RouterModule } from '@angular/router';
import { sidebarStateDTO } from '../../model/page.dto';
import { AuthService } from '../../services/auth.service';
import { PortalContextService } from '../../services/portal-context.service';
import { WidgetService } from '../../services/widget.service';
import { PermissionService } from '../../services/permission.service';
import {
  APP_PERMISSIONS,
  AppPermission,
} from '../../constants/permissions.constants';

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
  /** Item is hidden unless the user holds at least one of these. */
  permissions?: AppPermission[];
}

interface SidebarMenuSection {
  title: string | null;
  items: SidebarMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  sidebarVisible = false;
  isMobileViewport = false;
  _widgetService = inject(WidgetService);
  portalContextService = inject(PortalContextService);
  permissionService = inject(PermissionService);
  router = inject(Router);
  private readonly authService = inject(AuthService);
  openGroupRoute: string | null = null;
  readonly adminMenuSections: SidebarMenuSection[] = [
    {
      title: null,
      items: [
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
          permissions: [
            APP_PERMISSIONS.VIEW_APPLICANTS,
            APP_PERMISSIONS.VIEW_APPLICATIONS,
            APP_PERMISSIONS.MANAGE_APPLICANTS,
          ],
          children: [
            {
              label: 'OND',
              route: '/pages/applicants',
              queryParams: { programme: 'ond' },
            },
            {
              label: 'HND',
              route: '/pages/applicants',
              queryParams: { programme: 'hnd' },
            },
          ],
        },
        {
          label: 'Admissions',
          iconClass: 'bi bi-card-list',
          route: '/pages/admissions',
          permissions: [
            APP_PERMISSIONS.MANAGE_APPLICANTS,
            APP_PERMISSIONS.VIEW_APPLICANTS,
          ],
          children: [
            {
              label: 'OND',
              route: '/pages/admissions',
              queryParams: { programme: 'ond' },
            },
            {
              label: 'HND',
              route: '/pages/admissions',
              queryParams: { programme: 'hnd' },
            },
          ],
        },
        {
          label: 'Payment Records',
          iconClass: 'bi bi-wallet2',
          route: '/pages/payment-records',
          permissions: [
            APP_PERMISSIONS.MANAGE_FEES,
            APP_PERMISSIONS.MANAGE_APPLICATION_FEES_MANUALLY,
          ],
        },
      ],
    },
  ];
  readonly lecturerMenuSections: SidebarMenuSection[] = [
    {
      title: 'Lecturer',
      items: [
        {
          label: 'Dashboard',
          iconClass: 'bi bi-house',
          route: '/pages/lecturer/dashboard',
          exact: true,
        },
        {
          label: 'My Courses',
          iconClass: 'bi bi-journal-text',
          route: '/pages/lecturer/my-courses',
        },
        {
          label: 'Profile',
          iconClass: 'bi bi-person',
          route: '/pages/lecturer/profile',
        },
      ],
    },
  ];
  readonly hodMenuSections: SidebarMenuSection[] = [
    {
      title: 'Lecturer',
      items: [
        {
          label: 'Dashboard',
          iconClass: 'bi bi-house',
          route: '/pages/hod/dashboard',
          exact: true,
        },
        {
          label: 'My Courses',
          iconClass: 'bi bi-journal-text',
          route: '/pages/hod/my-courses',
        },
        {
          label: 'Profile',
          iconClass: 'bi bi-person',
          route: '/pages/hod/profile',
        },
      ],
    },
    {
      title: 'Department',
      items: [
        {
          label: 'Overview',
          iconClass: 'bi bi-grid',
          route: '/pages/hod/overview',
          exact: true,
        },
        {
          label: 'Verification',
          iconClass: 'bi bi-file-earmark-check',
          route: '/pages/hod/verification',
          children: [
            {
              label: 'Course Reg',
              route: '/pages/hod/verification/course-reg',
            },
            {
              label: 'Documents',
              route: '/pages/hod/verification/documents',
            },
          ],
        },
        {
          label: 'Result Review',
          iconClass: 'bi bi-graph-up-arrow',
          route: '/pages/hod/result-review',
        },
        {
          label: 'Students Record',
          iconClass: 'bi bi-clipboard-data',
          route: '/pages/hod/students-record',
        },
        {
          label: 'Lecturers',
          iconClass: 'bi bi-briefcase',
          route: '/pages/hod/lecturers',
        },
        {
          label: 'Courses',
          iconClass: 'bi bi-book',
          route: '/pages/hod/courses',
        },
      ],
    },
  ];

  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    });
    this.updateViewportState();
    this.openGroupRoute = this.getDefaultOpenGroup();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateViewportState();
  }

  toggleSidebar() {
    this._widgetService.setSidebarState({ isvisible: !this.sidebarVisible });
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

  onGroupItemClick(item: SidebarMenuItem): void {
    if (!item.children?.length) {
      return;
    }

    if (!this.sidebarVisible && !this.isMobileViewport) {
      return;
    }

    this.toggleGroup(item);
  }

  onNavigate(): void {
    if (this.isMobileViewport) {
      this.close();
    }
  }

  get isDesktopCollapsed(): boolean {
    return !this.sidebarVisible && !this.isMobileViewport;
  }

  get isMobileDrawerOpen(): boolean {
    return this.isMobileViewport && this.sidebarVisible;
  }

  get activeMenuSections(): SidebarMenuSection[] {
    if (this.portalContextService.isHodContext()) {
      return this.applyPermissions(this.hodMenuSections);
    }

    if (this.portalContextService.isLecturerContext()) {
      return this.applyPermissions(this.lecturerMenuSections);
    }

    return this.applyPermissions(this.adminMenuSections);
  }

  private applyPermissions(
    sections: SidebarMenuSection[],
  ): SidebarMenuSection[] {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            !item.permissions ||
            this.permissionService.hasAny(item.permissions),
        ),
      }))
      .filter((section) => section.items.length > 0);
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
    const expectedprogramme = item.queryParams?.['programme'];
    const currentprogramme = currentTree.queryParams['programme'];

    if (!normalizedCurrentPath.startsWith(item.route)) {
      return false;
    }
    if (!expectedprogramme) {
      return true;
    }
    return (
      String(currentprogramme ?? '').toLowerCase() ===
      String(expectedprogramme).toLowerCase()
    );
  }

  private getDefaultOpenGroup(): string | null {
    for (const section of this.activeMenuSections) {
      const matched = section.items.find(
        (item) => item.children?.length && this.isRouteActive(item.route),
      );

      if (matched) {
        return matched.route;
      }
    }

    return null;
  }

  private updateViewportState(): void {
    const mobileViewport = window.innerWidth <= 991;
    const viewportChanged = mobileViewport !== this.isMobileViewport;
    this.isMobileViewport = mobileViewport;

    if (mobileViewport && (viewportChanged || this.sidebarVisible)) {
      this._widgetService.setSidebarState({ isvisible: false });
      return;
    }

    if (!mobileViewport && viewportChanged && !this.sidebarVisible) {
      this._widgetService.setSidebarState({ isvisible: true });
    }
  }

  logOut() {
    this.authService.logoutToLogin();
  }
}

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { AppPermission } from '../constants/permissions.constants';
import { PermissionService } from '../services/permission.service';

export type PermissionMatchMode = 'any' | 'all';

/**
 * Renders the host element only when the signed-in user holds the required
 * permission(s).
 *
 *   <app-button *appHasPermission="'Manage applicants'">Shortlist</app-button>
 *   <div *appHasPermission="['Create users', 'Update users']; mode: 'all'">
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  private readonly requiredPermissions = signal<AppPermission[]>([]);
  private readonly matchMode = signal<PermissionMatchMode>('any');
  private isRendered = false;

  @Input({ required: true })
  set appHasPermission(value: AppPermission | AppPermission[]) {
    this.requiredPermissions.set(Array.isArray(value) ? value : [value]);
  }

  @Input()
  set appHasPermissionMode(value: PermissionMatchMode) {
    this.matchMode.set(value);
  }

  constructor() {
    effect(() => {
      const permissions = this.requiredPermissions();
      const allowed =
        this.matchMode() === 'all'
          ? this.permissionService.hasAll(permissions)
          : this.permissionService.hasAny(permissions);

      this.render(allowed);
    });
  }

  private render(allowed: boolean): void {
    if (allowed && !this.isRendered) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isRendered = true;
      return;
    }

    if (!allowed && this.isRendered) {
      this.viewContainer.clear();
      this.isRendered = false;
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly notifications = inject(NotificationsService);

  success(title: string, message: string) {
    this.notifications.success(title, message);
  }

  error(title: string, message: string) {
    this.notifications.error(title, message);
  }

  info(title: string, message: string) {
    this.notifications.info(title, message);
  }

  warn(title: string, message: string) {
    this.notifications.warn(title, message);
  }
}

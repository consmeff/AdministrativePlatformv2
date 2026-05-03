import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BusyIndicatorService } from './busy-indicator.service';

type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly busyService = inject(BusyIndicatorService);

  success(detail: string, summary = 'Success'): void {
    this.show('success', summary, detail);
  }

  info(detail: string, summary = 'Info'): void {
    this.show('info', summary, detail);
  }

  warn(detail: string, summary = 'Warning'): void {
    this.show('warn', summary, detail);
  }

  error(detail: string, summary = 'Error'): void {
    this.show('error', summary, detail);
  }

  private show(
    severity: NotificationSeverity,
    summary: string,
    detail: string,
  ): void {
    this.messageService.add({ severity, summary, detail });
    this.busyService.hide();
  }
}

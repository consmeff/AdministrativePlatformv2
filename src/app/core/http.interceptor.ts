import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { BusyIndicatorService } from '../services/busy-indicator.service';

export const contentTypeInterceptor: HttpInterceptorFn = (req, next) => {
  // Define the exempted route
  const exemptedRoute = '/api/v1/uploads';

  // Check if the method is POST, PUT, or PATCH and Content-Type is not already set
  const shouldSetContentType =
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.headers.has('Content-Type') &&
    !req.url.includes(exemptedRoute); // Exempt specific route

  // Update headers conditionally
  const headers = shouldSetContentType
    ? req.headers.set('Content-Type', 'application/json')
    : req.headers;

  // Clone the request with updated headers
  const clonedRequest = req.clone({ headers });

  // Pass the cloned request to the next handler
  return next(clonedRequest);
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const busyService = inject(BusyIndicatorService);

  return next(req).pipe(
    catchError((error: unknown) => {
      busyService.hide();

      if (!(error instanceof HttpErrorResponse)) {
        messageService.add({
          severity: 'error',
          summary: 'Request Failed',
          detail: 'An unexpected error occurred. Please try again.',
        });
        return throwError(() => error);
      }

      const detail = resolveErrorMessage(error);
      messageService.add({
        severity: 'error',
        summary: resolveSummary(error.status),
        detail,
      });
      return throwError(() => error);
    }),
  );
};

function resolveSummary(status: number): string {
  if (status === 0) {
    return 'Network Error';
  }
  if (status === 401) {
    return 'Unauthorized';
  }
  if (status === 403) {
    return 'Forbidden';
  }
  if (status === 404) {
    return 'Not Found';
  }
  if (status >= 500) {
    return 'Server Error';
  }
  return 'Request Failed';
}

function resolveErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Unable to reach the server. Check your network and try again.';
  }

  const backendError = error.error;
  if (typeof backendError === 'string' && backendError.trim().length > 0) {
    return backendError;
  }

  const messageFromObject = extractMessageFromObject(backendError);
  if (messageFromObject) {
    return messageFromObject;
  }

  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

function extractMessageFromObject(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const directKeys = ['message', 'detail', 'error', 'title'];
  for (const key of directKeys) {
    const raw = candidate[key];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw;
    }
  }

  const nestedMessages = collectMessages(value).slice(0, 3);
  if (nestedMessages.length > 0) {
    return nestedMessages.join('; ');
  }

  return null;
}

function collectMessages(value: unknown): string[] {
  const results: string[] = [];
  collectMessagesRecursively(value, results);
  return Array.from(new Set(results));
}

function collectMessagesRecursively(value: unknown, results: string[]): void {
  if (results.length >= 6 || value == null) {
    return;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      results.push(trimmed);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMessagesRecursively(item, results);
      if (results.length >= 6) {
        return;
      }
    }
    return;
  }

  if (typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const preferredKeys = [
    'non_field_errors',
    'message',
    'detail',
    'error',
    'errors',
  ];

  for (const key of preferredKeys) {
    if (key in record) {
      collectMessagesRecursively(record[key], results);
      if (results.length >= 6) {
        return;
      }
    }
  }

  for (const [key, child] of Object.entries(record)) {
    if (preferredKeys.includes(key)) {
      continue;
    }
    collectMessagesRecursively(child, results);
    if (results.length >= 6) {
      return;
    }
  }
}

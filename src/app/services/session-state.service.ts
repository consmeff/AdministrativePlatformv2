import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStateService {
  private readonly resetHandlers = new Set<() => void>();

  registerResetHandler(handler: () => void): () => void {
    this.resetHandlers.add(handler);

    return () => {
      this.resetHandlers.delete(handler);
    };
  }

  resetAll(): void {
    this.resetHandlers.forEach((handler) => handler());
  }
}

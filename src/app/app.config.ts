import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { jwtInterceptor } from './services/jwtinterceptor';
import { contentTypeInterceptor } from './core/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(),withInterceptors([contentTypeInterceptor,jwtInterceptor])),
    
    provideAnimationsAsync(),

    
    SimpleNotificationsModule.forRoot(
      {
        position: ["bottom", "right"],
        timeOut: 3000,
        lastOnBottom: true
  
    }
    ).providers!,
    providePrimeNG({
      theme: {
          preset: Aura
      }
  }),
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes)]
};



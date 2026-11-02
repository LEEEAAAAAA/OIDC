import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideKeycloak } from 'keycloak-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideKeycloak({
    config: {
      url: 'http://localhost:8180',
      realm: 'quarkus',
      clientId: 'frontend'
    },
    initOptions: {
      onLoad: 'check-sso', // With this feature enabled, your browser avoids a full redirect to the Keycloak server and back to your application
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    }
  }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ]
};

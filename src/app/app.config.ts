import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { withFetch, withInterceptors} from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';

/*import { authInterceptor } from 'environments/auth.interceptor';*/

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(), provideAnimationsAsync(),
    provideHttpClient(),
    provideAnimations(),
    /*provideHttpClient(withInterceptors([authInterceptor]))*/]
};

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthenticationStore } from '../services/authentication.store';
import { Observable, map } from 'rxjs';

export const authRedirectGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const authStore = inject(AuthenticationStore);
  const router = inject(Router);

  return authStore.auth$.pipe(
    map(state => {
      if (state.isSignedIn) {
        return router.parseUrl('/campaña');
      }
      return true;
    })
  );
};
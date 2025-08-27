import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthenticationStore } from '../services/authentication.store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

export const authenticationGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authStore = inject(AuthenticationStore);
  const router = inject(Router);

  return combineLatest([authStore.auth$, authStore.initialized$]).pipe(
    filter(([_, initialized]) => initialized), // Solo continúa cuando se haya leído localStorage
    take(1),
    map(([state]) => {
      return state.isSignedIn ? true : router.parseUrl('/sign-in');
    })
  );
};

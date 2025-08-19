import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { plantillaGuardGuard } from './plantilla-guard.guard';

describe('plantillaGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => plantillaGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

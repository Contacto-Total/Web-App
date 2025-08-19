import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { updateTemplateGuard } from './update-template.guard';

describe('updateTemplateGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => updateTemplateGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

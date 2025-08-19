import { TestBed } from '@angular/core/testing';

import { CampañaService } from './campaña.service';

describe('CampañaService', () => {
  let service: CampañaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CampañaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

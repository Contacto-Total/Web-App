import { TestBed } from '@angular/core/testing';

import { GestionHistoricaService } from './gestion-historica.service';

describe('GestionHistoricaService', () => {
  let service: GestionHistoricaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionHistoricaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

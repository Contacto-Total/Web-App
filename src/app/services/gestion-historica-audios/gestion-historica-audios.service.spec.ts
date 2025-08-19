import { TestBed } from '@angular/core/testing';

import { GestionHistoricaAudiosService } from './gestion-historica-audios.service';

describe('GestionHistoricaAudiosService', () => {
  let service: GestionHistoricaAudiosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionHistoricaAudiosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

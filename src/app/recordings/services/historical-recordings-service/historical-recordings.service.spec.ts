import { TestBed } from '@angular/core/testing';

import { HistoricalRecordingsService } from './historical-recordings.service';

describe('HistoricalRecordingsService', () => {
  let service: HistoricalRecordingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricalRecordingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

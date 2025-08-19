import { TestBed } from '@angular/core/testing';

import { AudioEvaluacionService } from './audio-evaluacion.service';

describe('AudioEvaluacionService', () => {
  let service: AudioEvaluacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioEvaluacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

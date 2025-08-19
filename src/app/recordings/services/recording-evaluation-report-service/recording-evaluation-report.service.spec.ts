import { TestBed } from '@angular/core/testing';

import { RecordingEvaluationReportService } from './recording-evaluation-report.service';

describe('RecordingEvaluationReportService', () => {
  let service: RecordingEvaluationReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordingEvaluationReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

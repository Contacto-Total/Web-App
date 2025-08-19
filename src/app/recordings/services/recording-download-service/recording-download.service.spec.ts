import { TestBed } from '@angular/core/testing';

import { RecordingDownloadService } from './recording-download.service';

describe('RecordingDownloadService', () => {
  let service: RecordingDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordingDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

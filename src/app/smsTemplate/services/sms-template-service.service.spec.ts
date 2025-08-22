import { TestBed } from '@angular/core/testing';

import { SmsTemplateServiceService } from './sms-template-service.service';

describe('SmsTemplateServiceService', () => {
  let service: SmsTemplateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmsTemplateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

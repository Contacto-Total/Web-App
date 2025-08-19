import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechReportComponent } from './speech-report.component';

describe('SpeechReportComponent', () => {
  let component: SpeechReportComponent;
  let fixture: ComponentFixture<SpeechReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpeechReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

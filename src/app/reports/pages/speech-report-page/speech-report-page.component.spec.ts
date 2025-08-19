import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechReportPageComponent } from './speech-report-page.component';

describe('SpeechReportPageComponent', () => {
  let component: SpeechReportPageComponent;
  let fixture: ComponentFixture<SpeechReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechReportPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpeechReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

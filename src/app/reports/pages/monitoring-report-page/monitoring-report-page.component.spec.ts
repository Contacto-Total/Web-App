import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringReportPageComponent } from './monitoring-report-page.component';

describe('MonitoringReportPageComponent', () => {
  let component: MonitoringReportPageComponent;
  let fixture: ComponentFixture<MonitoringReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoringReportPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonitoringReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

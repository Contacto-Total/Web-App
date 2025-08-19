import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoReportComponent } from './monitoreo-report.component';

describe('MonitoreoReportComponent', () => {
  let component: MonitoreoReportComponent;
  let fixture: ComponentFixture<MonitoreoReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoreoReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonitoreoReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

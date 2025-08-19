import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerBiReportPageComponent } from './power-bi-report-page.component';

describe('PowerBiReportPageComponent', () => {
  let component: PowerBiReportPageComponent;
  let fixture: ComponentFixture<PowerBiReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerBiReportPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PowerBiReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

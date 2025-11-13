import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteraPropiaReportPageComponent } from './cartera-propia-report-page.component';

describe('CarteraPropiaReportPageComponent', () => {
  let component: CarteraPropiaReportPageComponent;
  let fixture: ComponentFixture<CarteraPropiaReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteraPropiaReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteraPropiaReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

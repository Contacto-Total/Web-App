import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsFiltersComponent } from './sms-filters.component';

describe('SmsFiltersComponent', () => {
  let component: SmsFiltersComponent;
  let fixture: ComponentFixture<SmsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

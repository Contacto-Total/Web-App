import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReminderSmsComponent } from './payment-reminder-sms.component';

describe('PaymentReminderSmsComponent', () => {
  let component: PaymentReminderSmsComponent;
  let fixture: ComponentFixture<PaymentReminderSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReminderSmsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentReminderSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

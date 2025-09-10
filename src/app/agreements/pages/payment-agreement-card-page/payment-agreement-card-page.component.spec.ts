import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAgreementCardPageComponent } from './payment-agreement-card-page.component';

describe('PaymentAgreementCardPageComponent', () => {
  let component: PaymentAgreementCardPageComponent;
  let fixture: ComponentFixture<PaymentAgreementCardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentAgreementCardPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentAgreementCardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

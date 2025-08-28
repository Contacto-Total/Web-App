import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsVariablesComponent } from './sms-variables.component';

describe('SmsVariablesComponent', () => {
  let component: SmsVariablesComponent;
  let fixture: ComponentFixture<SmsVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsVariablesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmsVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

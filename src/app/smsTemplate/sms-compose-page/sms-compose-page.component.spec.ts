import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsComposePageComponent } from './sms-compose-page.component';

describe('SmsComposePageComponent', () => {
  let component: SmsComposePageComponent;
  let fixture: ComponentFixture<SmsComposePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsComposePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmsComposePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsPageComponent } from './sms-page.component';

describe('SmsPageComponent', () => {
  let component: SmsPageComponent;
  let fixture: ComponentFixture<SmsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

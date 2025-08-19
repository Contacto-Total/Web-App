import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsTemplatesSelectorComponent } from './sms-templates-selector.component';

describe('SmsTemplatesSelectorComponent', () => {
  let component: SmsTemplatesSelectorComponent;
  let fixture: ComponentFixture<SmsTemplatesSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsTemplatesSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmsTemplatesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

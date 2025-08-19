import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSmsTemplatePageComponent } from './update-sms-template-page.component';

describe('UpdateSmsTemplatePageComponent', () => {
  let component: UpdateSmsTemplatePageComponent;
  let fixture: ComponentFixture<UpdateSmsTemplatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSmsTemplatePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateSmsTemplatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

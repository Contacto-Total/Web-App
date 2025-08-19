import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSmsTemplateFormComponent } from './update-sms-template-form.component';

describe('UpdateSmsTemplateFormComponent', () => {
  let component: UpdateSmsTemplateFormComponent;
  let fixture: ComponentFixture<UpdateSmsTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSmsTemplateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateSmsTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

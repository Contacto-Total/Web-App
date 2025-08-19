import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSmsTemplateFormComponent } from './add-sms-template-form.component';

describe('AddSmsTemplateFormComponent', () => {
  let component: AddSmsTemplateFormComponent;
  let fixture: ComponentFixture<AddSmsTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSmsTemplateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSmsTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

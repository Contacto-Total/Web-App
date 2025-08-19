import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSmsTemplateFormComponent } from './create-sms-template-form.component';

describe('CreateSmsTemplateFormComponent', () => {
  let component: CreateSmsTemplateFormComponent;
  let fixture: ComponentFixture<CreateSmsTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSmsTemplateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSmsTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

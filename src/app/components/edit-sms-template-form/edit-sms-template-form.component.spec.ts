import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSmsTemplateFormComponent } from './edit-sms-template-form.component';

describe('EditSmsTemplateFormComponent', () => {
  let component: EditSmsTemplateFormComponent;
  let fixture: ComponentFixture<EditSmsTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSmsTemplateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSmsTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

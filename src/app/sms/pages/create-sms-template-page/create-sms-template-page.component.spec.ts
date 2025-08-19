import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSmsTemplatePageComponent } from './create-sms-template-page.component';

describe('CreateSmsTemplatePageComponent', () => {
  let component: CreateSmsTemplatePageComponent;
  let fixture: ComponentFixture<CreateSmsTemplatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSmsTemplatePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSmsTemplatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

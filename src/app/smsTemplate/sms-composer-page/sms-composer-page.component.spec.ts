import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsComposerPageComponentComponent } from './sms-composer-page.component';

describe('SmsComposerPageComponentComponent', () => {
  let component: SmsComposerPageComponentComponent;
  let fixture: ComponentFixture<SmsComposerPageComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsComposerPageComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsComposerPageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

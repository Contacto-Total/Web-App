import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsPreviewTableComponent } from './sms-preview-table.component';

describe('SmsPreviewTableComponent', () => {
  let component: SmsPreviewTableComponent;
  let fixture: ComponentFixture<SmsPreviewTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsPreviewTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsPreviewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

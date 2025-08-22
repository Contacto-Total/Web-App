import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpSmsComponent } from './follow-up-sms.component';

describe('FollowUpSmsComponent', () => {
  let component: FollowUpSmsComponent;
  let fixture: ComponentFixture<FollowUpSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpSmsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowUpSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

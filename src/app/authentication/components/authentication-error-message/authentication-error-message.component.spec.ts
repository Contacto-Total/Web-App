import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationErrorMessageComponent } from './authentication-error-message.component';

describe('AuthenticationErrorMessageComponent', () => {
  let component: AuthenticationErrorMessageComponent;
  let fixture: ComponentFixture<AuthenticationErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationErrorMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthenticationErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationInputComponent } from './authentication-input.component';

describe('AuthenticationInputComponent', () => {
  let component: AuthenticationInputComponent;
  let fixture: ComponentFixture<AuthenticationInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthenticationInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

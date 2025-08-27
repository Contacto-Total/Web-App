import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationTitleComponent } from './authentication-title.component';

describe('AuthenticationTitleComponent', () => {
  let component: AuthenticationTitleComponent;
  let fixture: ComponentFixture<AuthenticationTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationTitleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthenticationTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToBlacklistFormComponent } from './add-to-blacklist-form.component';

describe('AddToBlacklistFormComponent', () => {
  let component: AddToBlacklistFormComponent;
  let fixture: ComponentFixture<AddToBlacklistFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToBlacklistFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddToBlacklistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

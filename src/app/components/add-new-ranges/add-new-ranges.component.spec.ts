import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewRangesComponent } from './add-new-ranges.component';

describe('AddNewRangesComponent', () => {
  let component: AddNewRangesComponent;
  let fixture: ComponentFixture<AddNewRangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewRangesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewRangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

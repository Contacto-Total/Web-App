import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditComboDialogComponent } from './edit-combo-dialog.component';

describe('EditComboDialogComponent', () => {
  let component: EditComboDialogComponent;
  let fixture: ComponentFixture<EditComboDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditComboDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditComboDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

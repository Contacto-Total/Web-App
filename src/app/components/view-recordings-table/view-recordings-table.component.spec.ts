import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecordingsTableComponent } from './view-recordings-table.component';

describe('ViewRecordingsTableComponent', () => {
  let component: ViewRecordingsTableComponent;
  let fixture: ComponentFixture<ViewRecordingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRecordingsTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRecordingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

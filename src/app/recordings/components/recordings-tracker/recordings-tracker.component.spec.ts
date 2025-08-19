import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingsTrackerComponent } from './recordings-tracker.component';

describe('RecordingsTrackerComponent', () => {
  let component: RecordingsTrackerComponent;
  let fixture: ComponentFixture<RecordingsTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingsTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecordingsTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

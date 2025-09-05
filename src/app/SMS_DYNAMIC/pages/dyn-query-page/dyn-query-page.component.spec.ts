import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynQueryPageComponent } from './dyn-query-page.component';

describe('DynQueryPageComponent', () => {
  let component: DynQueryPageComponent;
  let fixture: ComponentFixture<DynQueryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynQueryPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynQueryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

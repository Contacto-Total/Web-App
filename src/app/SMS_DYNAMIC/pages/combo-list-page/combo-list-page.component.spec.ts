import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboListPageComponent } from './combo-list-page.component';

describe('ComboListPageComponent', () => {
  let component: ComboListPageComponent;
  let fixture: ComponentFixture<ComboListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboListPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComboListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

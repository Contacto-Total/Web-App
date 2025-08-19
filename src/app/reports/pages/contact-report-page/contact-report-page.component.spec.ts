import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactReportPageComponent } from './contact-report-page.component';

describe('ContactReportPageComponent', () => {
  let component: ContactReportPageComponent;
  let fixture: ComponentFixture<ContactReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactReportPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

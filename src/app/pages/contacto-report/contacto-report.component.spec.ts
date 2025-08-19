import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoReportComponent } from './contacto-report.component';

describe('ContactoReportComponent', () => {
  let component: ContactoReportComponent;
  let fixture: ComponentFixture<ContactoReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactoReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

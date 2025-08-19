import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingReportPageComponent } from './ranking-report-page.component';

describe('RankingReportPageComponent', () => {
  let component: RankingReportPageComponent;
  let fixture: ComponentFixture<RankingReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingReportPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RankingReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

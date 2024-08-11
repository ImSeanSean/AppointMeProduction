import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentViewMergedComponent } from './appointment-view-merged.component';

describe('AppointmentViewMergedComponent', () => {
  let component: AppointmentViewMergedComponent;
  let fixture: ComponentFixture<AppointmentViewMergedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentViewMergedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentViewMergedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentViewFinishedComponent } from './appointment-view-finished.component';

describe('AppointmentViewFinishedComponent', () => {
  let component: AppointmentViewFinishedComponent;
  let fixture: ComponentFixture<AppointmentViewFinishedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentViewFinishedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentViewFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentCardCompletedComponent } from './appointment-card-completed.component';

describe('AppointmentCardCompletedComponent', () => {
  let component: AppointmentCardCompletedComponent;
  let fixture: ComponentFixture<AppointmentCardCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentCardCompletedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentCardCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

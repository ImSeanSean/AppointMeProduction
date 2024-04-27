import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStudentConfirmedComponent } from './appointment-student-confirmed.component';

describe('AppointmentStudentConfirmedComponent', () => {
  let component: AppointmentStudentConfirmedComponent;
  let fixture: ComponentFixture<AppointmentStudentConfirmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentStudentConfirmedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentStudentConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

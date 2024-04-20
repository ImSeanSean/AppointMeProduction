import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStudentComponent } from './appointment-student.component';

describe('AppointmentStudentComponent', () => {
  let component: AppointmentStudentComponent;
  let fixture: ComponentFixture<AppointmentStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentStudentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

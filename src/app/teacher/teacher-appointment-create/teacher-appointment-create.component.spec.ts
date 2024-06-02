import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAppointmentCreateComponent } from './teacher-appointment-create.component';

describe('TeacherAppointmentCreateComponent', () => {
  let component: TeacherAppointmentCreateComponent;
  let fixture: ComponentFixture<TeacherAppointmentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAppointmentCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeacherAppointmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

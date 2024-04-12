import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRegistrationApprovalComponent } from './teacher-registration-approval.component';

describe('TeacherRegistrationApprovalComponent', () => {
  let component: TeacherRegistrationApprovalComponent;
  let fixture: ComponentFixture<TeacherRegistrationApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherRegistrationApprovalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeacherRegistrationApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

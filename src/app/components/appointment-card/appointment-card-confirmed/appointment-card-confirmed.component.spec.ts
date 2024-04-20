import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentCardConfirmedComponent } from './appointment-card-confirmed.component';

describe('AppointmentCardConfirmedComponent', () => {
  let component: AppointmentCardConfirmedComponent;
  let fixture: ComponentFixture<AppointmentCardConfirmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentCardConfirmedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentCardConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

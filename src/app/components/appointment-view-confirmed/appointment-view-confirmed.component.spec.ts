import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentViewConfirmedComponent } from './appointment-view-confirmed.component';

describe('AppointmentViewConfirmedComponent', () => {
  let component: AppointmentViewConfirmedComponent;
  let fixture: ComponentFixture<AppointmentViewConfirmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentViewConfirmedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentViewConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

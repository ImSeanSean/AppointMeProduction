import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentView2Component } from './appointment-view-2.component';

describe('AppointmentView2Component', () => {
  let component: AppointmentView2Component;
  let fixture: ComponentFixture<AppointmentView2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentView2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentView2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

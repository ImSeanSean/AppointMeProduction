import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentView1Component } from './appointment-view-1.component';

describe('AppointmentView1Component', () => {
  let component: AppointmentView1Component;
  let fixture: ComponentFixture<AppointmentView1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentView1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentView1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

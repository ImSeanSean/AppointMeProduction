import { TestBed } from '@angular/core/testing';

import { AppointmentViewServiceService } from './appointment-view-service.service';

describe('AppointmentViewServiceService', () => {
  let service: AppointmentViewServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentViewServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { CompletedAppointmentDataService } from './completed-appointment-data.service';

describe('CompletedAppointmentDataService', () => {
  let service: CompletedAppointmentDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompletedAppointmentDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

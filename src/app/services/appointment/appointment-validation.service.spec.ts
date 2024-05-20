import { TestBed } from '@angular/core/testing';

import { AppointmentValidationService } from './appointment-validation.service';

describe('AppointmentValidationService', () => {
  let service: AppointmentValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

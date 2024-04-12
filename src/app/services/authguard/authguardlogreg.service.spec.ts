import { TestBed } from '@angular/core/testing';

import { AuthguardlogregService } from './authguardlogreg.service';

describe('AuthguardlogregService', () => {
  let service: AuthguardlogregService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthguardlogregService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

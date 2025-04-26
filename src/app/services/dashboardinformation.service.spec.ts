import { TestBed } from '@angular/core/testing';

import { DashboardinformationService } from './dashboardinformation.service';

describe('DashboardinformationService', () => {
  let service: DashboardinformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardinformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

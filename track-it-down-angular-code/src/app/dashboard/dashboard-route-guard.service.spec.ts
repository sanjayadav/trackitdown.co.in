import { TestBed } from '@angular/core/testing';

import { DashboardRouteGuardService } from './dashboard-route-guard.service';

describe('DashboardRouteGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardRouteGuardService = TestBed.get(DashboardRouteGuardService);
    expect(service).toBeTruthy();
  });
});

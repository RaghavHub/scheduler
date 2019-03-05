import { TestBed } from '@angular/core/testing';

import { ScheduleFetchService } from './schedule-fetch.service';

describe('ScheduleFetchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScheduleFetchService = TestBed.get(ScheduleFetchService);
    expect(service).toBeTruthy();
  });
});

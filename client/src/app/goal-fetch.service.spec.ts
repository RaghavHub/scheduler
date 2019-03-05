import { TestBed } from '@angular/core/testing';

import { GoalFetchService } from './goal-fetch.service';

describe('GoalFetchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoalFetchService = TestBed.get(GoalFetchService);
    expect(service).toBeTruthy();
  });
});

import { buildDashboardSnapshot, dashboardFixture } from '../../data/dashboardMock.js';

// Capability adapter: no production URL is assumed. Replace after contract review.
export const dashboardApi = {
  getSummary: async ({ branch = '' } = {}) => buildDashboardSnapshot(dashboardFixture, branch),
};

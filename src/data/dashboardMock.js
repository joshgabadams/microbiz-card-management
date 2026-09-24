import { cards } from './mockData.js';
import { inventoryReference } from './inventoryReference.js';
import { maskPan } from '../utils/maskPan.js';

// Fixed fixture date and thresholds, not production policy or the browser clock.
export const dashboardFixture = {
  reportingDate: inventoryReference.reportingDate,
  branches: inventoryReference.branches.map(name => ({ name, minimumAvailable: inventoryReference.minimumAvailable })),
  cards,
};

// Mock-only aggregation. A real dashboard adapter will supply these summaries.
export function buildDashboardSnapshot(fixture, branch = '') {
  const scopedCards = fixture.cards.filter(card => !branch || card.branch === branch);
  const scopedBranches = fixture.branches.filter(item => !branch || item.name === branch);
  const statusCounts = scopedCards.reduce((counts, card) => {
    counts[card.status] = (counts[card.status] || 0) + 1;
    return counts;
  }, {});
  const issued = scopedCards.filter(card => card.issuedOn);
  const inventory = scopedBranches.map(item => {
    const available = scopedCards.filter(card => card.branch === item.name && card.status === 'AVAILABLE').length;
    return { ...item, available, lowStock: available < item.minimumAvailable };
  });
  const attention = inventory.filter(item => item.lowStock).map(item => ({
    id: `stock-${item.name}`, kind: 'stock', tone: 'warning',
    title: `${item.name}: low stock`,
    description: `${item.available} available · demo minimum ${item.minimumAvailable}`,
  }));
  for (const status of ['FROZEN', 'BLOCKED', 'EXPIRED']) {
    if (statusCounts[status]) attention.push({
      id: status, kind: 'status', status, tone: status === 'BLOCKED' ? 'danger' : 'warning',
      title: `${statusCounts[status]} ${status.toLowerCase()} ${statusCounts[status] === 1 ? 'card' : 'cards'}`,
      description: 'Review current card records. No action has been taken.',
    });
  }
  return {
    reportingDate: fixture.reportingDate,
    branches: fixture.branches.map(item => item.name),
    scope: branch || 'All branches',
    metrics: {
      total: scopedCards.length,
      available: statusCounts.AVAILABLE || 0,
      issued: issued.length,
      active: statusCounts.ACTIVE || 0,
      frozen: statusCounts.FROZEN || 0,
      blocked: statusCounts.BLOCKED || 0,
      expired: statusCounts.EXPIRED || 0,
      issuedToday: issued.filter(card => card.issuedOn === fixture.reportingDate).length,
    },
    inventory,
    attention,
    distribution: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    recentIssuance: [...issued].sort((a, b) => b.issuedOn.localeCompare(a.issuedOn)).slice(0, 5).map(card => ({
      id: card.id, serial: card.serial, pan: maskPan(card.pan), customer: card.customer,
      product: card.product, branch: card.branch, status: card.status, issuedOn: card.issuedOn,
    })),
  };
}

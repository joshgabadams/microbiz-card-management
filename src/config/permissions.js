export function routePermission(path) {
  path = path.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/overview') return 'dashboard.read';
  if (path === '/cards/available') return 'inventory.read';
  if (path === '/cards' || path.startsWith('/cards/')) return 'cards.read';
  if (path === '/issuance/new') return 'issuance.issue';
  if (path === '/issuance/history') return 'issuance.read';
  if (path === '/customers' || path.startsWith('/customers/')) return 'customers.read';
  if (path === '/inventory/receive') return 'inventory.receive';
  if (path.startsWith('/inventory')) return 'inventory.read';
  return ({ '/activity': 'activity.read', '/audit': 'audit.read', '/approvals': 'approvals.read', '/admin/card-products': 'products.read', '/admin/branches': 'branches.read', '/admin/users': 'users.read', '/settings': 'profile.read' })[path] || null;
}
export const demoPermissions = ['dashboard.read', 'cards.read', 'customers.read', 'inventory.read', 'inventory.receive', 'issuance.read', 'issuance.issue', 'activity.read', 'audit.read', 'approvals.read', 'products.read', 'branches.read', 'users.read', 'profile.read'];

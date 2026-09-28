import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { PermissionRoute } from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import { Navigate, Route, Routes } from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage';
import AppShell from './layouts/AppShell';
import OverviewPage from './pages/OverviewPage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import IssueCardPage from './pages/IssueCardPage';
import InventoryPage from './pages/InventoryPage';
import ReceiveCardsPage from './pages/ReceiveCardsPage';
import CardBatchesPage from './pages/CardBatchesPage';
import StockOperationsPage from './pages/StockOperationsPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import IssuanceHistoryPage from './pages/IssuanceHistoryPage';
import ActivityPage from './pages/ActivityPage';
import AuditPage from './pages/AuditPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UiFoundationsPage from './pages/UiFoundationsPage';
import SimplePage from './pages/SimplePage';

export default function App() {
  return (
    <AuthProvider><Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
      <Route element={<PermissionRoute />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/cards" element={<CardsPage title="All Cards" filter="all" />} />
        <Route path="/cards/available" element={<InventoryPage availableOnly />} />
        <Route path="/cards/issued" element={<CardsPage title="Issued Cards" filter="issued" />} />
        <Route path="/cards/frozen" element={<CardsPage title="Frozen Cards" filter="FROZEN" />} />
        <Route path="/cards/blocked" element={<CardsPage title="Blocked Cards" filter="BLOCKED" />} />
        <Route path="/cards/expired" element={<CardsPage title="Expired Cards" filter="EXPIRED" />} />
        <Route path="/cards/:cardId" element={<CardDetailPage />} />
        <Route path="/issuance/new" element={<IssueCardPage />} />
        <Route path="/issuance/history" element={<IssuanceHistoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/receive" element={<ReceiveCardsPage />} />
        <Route path="/inventory/batches" element={<CardBatchesPage />} />
        <Route path="/inventory/transfers" element={<StockOperationsPage />} />
        <Route path="/inventory/reconciliation" element={<StockOperationsPage reconciliation />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/admin/card-products" element={<SimplePage title="Card Products" description="View card products, schemes and backend-provided configuration." />} />
        <Route path="/admin/branches" element={<SimplePage title="Branches" description="Reference branch locations used for inventory ownership." />} />
        <Route path="/admin/users" element={<SimplePage title="Users & Roles" description="Role and entitlement visibility when exposed by the authorization API." />} />
        <Route path="/ui-foundations" element={<UiFoundationsPage />} />
        <Route path="/settings" element={<SimplePage title="Settings" description="Application preferences and user profile settings." />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>
    </Route>
    </Routes></AuthProvider>
  );
}

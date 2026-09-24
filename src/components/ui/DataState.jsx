import { Inbox } from 'lucide-react';
import Button from './Button';

export function Skeleton({ className = '' }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}
export function LoadingState({ label = 'Loading…' }) {
  return <div className="loading-state" role="status"><span className="brand-loader" aria-hidden="true" /><span>{label}</span></div>;
}
export function EmptyState({ title = 'No records found', description = 'Try changing your search or filters.', action, icon: Icon = Inbox }) {
  return <div className="empty-panel"><div className="empty-icon"><Icon aria-hidden="true" /></div><h2>{title}</h2><p>{description}</p>{action}</div>;
}
export function ErrorState({ onRetry }) {
  return <div className="empty-panel" role="alert"><h2>Unable to load records</h2><p>Please try again. If the problem continues, contact your support team.</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}
